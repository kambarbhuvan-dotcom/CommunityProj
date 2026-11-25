/**
 * energyStorageService.js
 *
 * Energy Records Data Service with Supabase Integration:
 * - Queries and mutates the PostgreSQL 'energy_records' table via Supabase client.
 * - Enforces Row Level Security (RLS) on backend.
 * - Bidirectional field mapping:
 *     recorded_date <-> log_date
 *     solar_generated <-> solar_generated_kwh
 *     electricity_consumed <-> consumption_kwh
 *     solar_utilized <-> solar_utilized_kwh
 * - Fallback to resilient localStorage with seeded records when Supabase is offline or unconfigured.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { DEMO_DAILY_LOGS } from '../data/demoData'
import { ELECTRICITY_RATE, todayISO } from '../utils/constants'
import { calcCostSaved, calcEnergyBalance } from '../utils/calculations'

const STORAGE_KEY = 'solarconnect_energy_records_v1'
const BUILDINGS_KEY = 'solarconnect_community_buildings_v1'

export const DEFAULT_COMMUNITIES = [
  'Sunrise Apartments Block A',
  'Sunrise Apartments Block B',
  'Green Valley Eco-Homes',
  'Solar Heights Residency',
  'EcoView Community Park',
]

/**
 * Initializes and returns local fallback records.
 */
export function getStoredRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.warn('[energyStorageService] Failed to read localStorage:', err)
  }

  // Seed with enriched demo logs
  const seeded = DEMO_DAILY_LOGS.map((log, index) => {
    const community = DEFAULT_COMMUNITIES[index % DEFAULT_COMMUNITIES.length]
    return {
      ...log,
      building: community,
      recorded_date: log.log_date,
      solar_generated: log.solar_generated_kwh,
      electricity_consumed: log.consumption_kwh,
      solar_utilized: log.solar_utilized_kwh,
    }
  })

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded))
  } catch {}

  return seeded
}

export function saveAllRecords(records) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch (err) {
    console.error('[energyStorageService] Failed to write localStorage:', err)
  }
}

/**
 * Normalizes a database row to standard frontend record format.
 */
function normalizeRecord(row) {
  const gen = Number(row.solar_generated ?? row.solar_generated_kwh) || 0
  const con = Number(row.electricity_consumed ?? row.consumption_kwh) || 0
  const uti = Number(row.solar_utilized ?? row.solar_utilized_kwh) || 0
  const d = row.recorded_date || row.log_date || todayISO()

  return {
    id: row.id,
    building_id: row.building_id || null,
    building: row.buildings?.building_name || row.building || 'Sunrise Apartments Block A',
    recorded_date: d,
    log_date: d,
    solar_generated: gen,
    solar_generated_kwh: gen,
    electricity_consumed: con,
    consumption_kwh: con,
    solar_utilized: uti,
    solar_utilized_kwh: uti,
    grid_export_kwh: parseFloat(Math.max(0, gen - uti).toFixed(2)),
    grid_import_kwh: parseFloat(Math.max(0, con - uti).toFixed(2)),
    notes: row.notes || '',
    created_by: row.created_by || null,
    created_at: row.created_at || new Date().toISOString(),
    is_demo: Boolean(row.is_demo ?? false),
  }
}

/**
 * Retrieve all records (from Supabase if configured, otherwise localStorage).
 */
export async function getAllRecords() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('energy_records')
        .select(`
          id,
          building_id,
          recorded_date,
          solar_generated,
          electricity_consumed,
          solar_utilized,
          notes,
          created_by,
          created_at,
          buildings (
            building_name
          )
        `)
        .order('recorded_date', { ascending: false })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(normalizeRecord)
      }
    } catch (err) {
      console.warn('[energyStorageService] Supabase fetch error, using local fallback:', err)
    }
  }

  // Local storage fallback
  const local = getStoredRecords()
  return local.map(normalizeRecord).sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
}

/**
 * Retrieve a single record by ID.
 */
export async function getRecordById(id) {
  if (isSupabaseConfigured && !id.startsWith('rec-')) {
    try {
      const { data, error } = await supabase
        .from('energy_records')
        .select('*, buildings(building_name)')
        .eq('id', id)
        .single()

      if (!error && data) return normalizeRecord(data)
    } catch {}
  }

  const records = getStoredRecords()
  const found = records.find((r) => r.id === id)
  return found ? normalizeRecord(found) : null
}

/**
 * Check if a duplicate record exists for a date and building.
 */
export function checkDuplicateRecord(logDate, building, excludeId = null) {
  const records = getStoredRecords()
  return records.find(
    (r) =>
      (r.recorded_date === logDate || r.log_date === logDate) &&
      (r.building?.trim().toLowerCase() === building?.trim().toLowerCase()) &&
      r.id !== excludeId
  ) || null
}

/**
 * Save or update an energy record (to Supabase and local cache).
 */
export async function saveRecord(recordData, userId = null) {
  const gen = Number(recordData.solar_generated ?? recordData.solar_generated_kwh) || 0
  const con = Number(recordData.electricity_consumed ?? recordData.consumption_kwh) || 0
  const uti = Number(recordData.solar_utilized ?? recordData.solar_utilized_kwh) || 0
  const dateStr = recordData.recorded_date || recordData.log_date || todayISO()

  // 1. Try Supabase write if configured
  if (isSupabaseConfigured) {
    try {
      let resolvedUserId = userId
      if (!resolvedUserId) {
        const { data: { user } } = await supabase.auth.getUser()
        resolvedUserId = user?.id || null
      }

      const dbPayload = {
        building_id: recordData.building_id || null,
        recorded_date: dateStr,
        solar_generated: parseFloat(gen.toFixed(2)),
        electricity_consumed: parseFloat(con.toFixed(2)),
        solar_utilized: parseFloat(uti.toFixed(2)),
        notes: recordData.notes?.trim() || '',
      }

      if (recordData.id && !recordData.id.startsWith('rec-')) {
        // Update existing row
        const { data, error } = await supabase
          .from('energy_records')
          .update(dbPayload)
          .eq('id', recordData.id)
          .select('*, buildings(building_name)')
          .single()

        if (!error && data) {
          const normalized = normalizeRecord(data)
          syncToLocalCache(normalized)
          return normalized
        }
      } else {
        // Insert new row
        if (resolvedUserId) {
          dbPayload.created_by = resolvedUserId
        }
        const { data, error } = await supabase
          .from('energy_records')
          .insert(dbPayload)
          .select('*, buildings(building_name)')
          .single()

        if (!error && data) {
          const normalized = normalizeRecord(data)
          syncToLocalCache(normalized)
          return normalized
        }
      }
    } catch (err) {
      console.warn('[energyStorageService] Supabase write failed, writing locally:', err)
    }
  }

  // 2. Local resilient storage
  const cleanRecord = normalizeRecord({
    ...recordData,
    id: recordData.id || `rec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    recorded_date: dateStr,
    log_date: dateStr,
    solar_generated: gen,
    solar_generated_kwh: gen,
    electricity_consumed: con,
    consumption_kwh: con,
    solar_utilized: uti,
    solar_utilized_kwh: uti,
  })

  syncToLocalCache(cleanRecord)
  return cleanRecord
}

function syncToLocalCache(record) {
  const records = getStoredRecords()
  const idx = records.findIndex((r) => r.id === record.id)
  let updated = []
  if (idx >= 0) {
    updated = [...records]
    updated[idx] = record
  } else {
    updated = [record, ...records]
  }
  saveAllRecords(updated)
}

/**
 * Delete a record by ID.
 */
export async function deleteRecord(id) {
  if (isSupabaseConfigured && !id.startsWith('rec-')) {
    try {
      const { error } = await supabase
        .from('energy_records')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('[energyStorageService] Supabase delete error:', error.message)
      }
    } catch (err) {
      console.warn('[energyStorageService] Supabase delete failed:', err)
    }
  }

  const records = getStoredRecords()
  const filtered = records.filter((r) => r.id !== id)
  saveAllRecords(filtered)
  return true
}

/**
 * Fetch list of community buildings.
 */
export async function getCommunityBuildings() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, building_name, location')
        .order('building_name', { ascending: true })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data
      }
    } catch {}
  }

  return DEFAULT_COMMUNITIES.map((name, idx) => ({
    id: `bld-default-${idx + 1}`,
    building_name: name,
    location: 'Bengaluru',
  }))
}

export function getCommunityList() {
  return DEFAULT_COMMUNITIES
}

export async function resetRecordsToDemo() {
  localStorage.removeItem(STORAGE_KEY)
  return getStoredRecords().map(normalizeRecord)
}

export function calculateRecordTotals(records = [], tariff = ELECTRICITY_RATE) {
  let totalGen = 0
  let totalConsumed = 0
  let totalUtilized = 0

  records.forEach((r) => {
    totalGen += Number(r.solar_generated ?? r.solar_generated_kwh) || 0
    totalConsumed += Number(r.electricity_consumed ?? r.consumption_kwh) || 0
    totalUtilized += Number(r.solar_utilized ?? r.solar_utilized_kwh) || 0
  })

  const difference = calcEnergyBalance(totalGen, totalConsumed)
  const savings = calcCostSaved(totalUtilized, tariff)

  return {
    totalGen: parseFloat(totalGen.toFixed(2)),
    totalConsumed: parseFloat(totalConsumed.toFixed(2)),
    totalUtilized: parseFloat(totalUtilized.toFixed(2)),
    difference: parseFloat(difference.toFixed(2)),
    savings: parseFloat(savings.toFixed(2)),
    count: records.length,
  }
}

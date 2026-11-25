/**
 * solarDataService.js
 *
 * Real user data service for SolarConnect:
 * - Manages user's Solar Installation Setup (`solar_systems` table / scoped localStorage)
 * - Manages user's Settings & Tariffs (`user_settings` table / scoped localStorage)
 * - Manages user's Daily Energy Logs (`energy_logs` table / scoped localStorage)
 *
 * ZERO DEMO DATA:
 * - If no records exist, returns empty array [].
 * - Never seeds fake or demo records.
 * - Resilient offline/local fallback scoped per user ID.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { api, localBackendReady } from '../lib/localBackend'
import { calcRecordSelfConsumption } from '../utils/calculations'

const SETUP_PREFIX = 'solarconnect_setup_'
const SETTINGS_PREFIX = 'solarconnect_settings_'
const LOGS_PREFIX = 'solarconnect_logs_'

const DEFAULT_SETTINGS = {
  electricity_tariff_inr: 7.50,
  grid_emission_factor: 0.82,
  avg_daily_consumption_kwh: null,
  avg_monthly_consumption_kwh: null,
  household_members: 4,
  electricity_provider: '',
}

function resolveUserKey(userId) {
  return userId || 'default_user'
}

/* =========================================================================
 * 1. SOLAR SYSTEM SETUP
 * ========================================================================= */

export async function getSolarSetup(userId) {
  const userKey = resolveUserKey(userId)

  if (await localBackendReady()) {
    try {
      return await api('/api/setup')
    } catch (err) {
      console.warn('[solarDataService] Local API setup read failed:', err.message)
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('solar_systems')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) {
        localStorage.setItem(SETUP_PREFIX + userKey, JSON.stringify(data))
        return data
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to load solar setup from Supabase:', err)
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(SETUP_PREFIX + userKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export async function saveSolarSetup(userId, setupData) {
  const userKey = resolveUserKey(userId)
  const payload = {
    system_capacity_kw: Number(setupData.system_capacity_kw) || 0,
    panel_type: setupData.panel_type || 'Monocrystalline',
    panel_count: Number(setupData.panel_count) || 0,
    installation_date: setupData.installation_date || null,
    city_location: setupData.city_location || '',
    inverter_capacity_kw: Number(setupData.inverter_capacity_kw) || 0,
    has_battery_storage: Boolean(setupData.has_battery_storage),
    battery_capacity_kwh: Number(setupData.battery_capacity_kwh) || 0,
    system_type: setupData.system_type || 'on_grid',
    updated_at: new Date().toISOString(),
  }

  if (await localBackendReady()) {
    try {
      const saved = await api('/api/setup', { method: 'PUT', body: payload })
      localStorage.setItem(SETUP_PREFIX + userKey, JSON.stringify(saved))
      return saved
    } catch (err) {
      console.warn('[solarDataService] Local API setup save failed:', err.message)
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data: existing } = await supabase
        .from('solar_systems')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existing?.id) {
        const { data, error } = await supabase
          .from('solar_systems')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()

        if (!error && data) {
          localStorage.setItem(SETUP_PREFIX + userKey, JSON.stringify(data))
          return data
        }
      } else {
        const { data, error } = await supabase
          .from('solar_systems')
          .insert({ ...payload, user_id: userId })
          .select()
          .single()

        if (!error && data) {
          localStorage.setItem(SETUP_PREFIX + userKey, JSON.stringify(data))
          return data
        }
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to save solar setup to Supabase:', err)
    }
  }

  // Local fallback
  const localRecord = {
    id: `setup_${userKey}`,
    user_id: userId || 'local',
    ...payload,
    created_at: new Date().toISOString(),
  }
  localStorage.setItem(SETUP_PREFIX + userKey, JSON.stringify(localRecord))
  return localRecord
}

/* =========================================================================
 * 2. USER SETTINGS
 * ========================================================================= */

export async function getUserSettings(userId) {
  const userKey = resolveUserKey(userId)

  if (await localBackendReady()) {
    try {
      return await api('/api/settings')
    } catch (err) {
      console.warn('[solarDataService] Local API settings read failed:', err.message)
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle()

      if (!error && data) {
        localStorage.setItem(SETTINGS_PREFIX + userKey, JSON.stringify(data))
        return data
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to load settings from Supabase:', err)
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(SETTINGS_PREFIX + userKey)
    if (raw) return JSON.parse(raw)
  } catch {}

  return { ...DEFAULT_SETTINGS, user_id: userId || 'local' }
}

export async function saveUserSettings(userId, settingsData) {
  const userKey = resolveUserKey(userId)
  const payload = {
    electricity_tariff_inr: Number(settingsData.electricity_tariff_inr ?? 7.50),
    grid_emission_factor: Number(settingsData.grid_emission_factor ?? 0.82),
    avg_daily_consumption_kwh: settingsData.avg_daily_consumption_kwh !== null && settingsData.avg_daily_consumption_kwh !== ''
      ? Number(settingsData.avg_daily_consumption_kwh) : null,
    avg_monthly_consumption_kwh: settingsData.avg_monthly_consumption_kwh !== null && settingsData.avg_monthly_consumption_kwh !== ''
      ? Number(settingsData.avg_monthly_consumption_kwh) : null,
    household_members: Number(settingsData.household_members ?? 4),
    electricity_provider: settingsData.electricity_provider || '',
    updated_at: new Date().toISOString(),
  }

  if (await localBackendReady()) {
    try {
      const saved = await api('/api/settings', { method: 'PUT', body: payload })
      localStorage.setItem(SETTINGS_PREFIX + userKey, JSON.stringify(saved))
      return saved
    } catch (err) {
      console.warn('[solarDataService] Local API settings save failed:', err.message)
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (existing?.id) {
        const { data, error } = await supabase
          .from('user_settings')
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()

        if (!error && data) {
          localStorage.setItem(SETTINGS_PREFIX + userKey, JSON.stringify(data))
          return data
        }
      } else {
        const { data, error } = await supabase
          .from('user_settings')
          .insert({ ...payload, user_id: userId })
          .select()
          .single()

        if (!error && data) {
          localStorage.setItem(SETTINGS_PREFIX + userKey, JSON.stringify(data))
          return data
        }
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to save settings to Supabase:', err)
    }
  }

  // Local fallback
  const localSettings = {
    id: `settings_${userKey}`,
    user_id: userId || 'local',
    ...payload,
  }
  localStorage.setItem(SETTINGS_PREFIX + userKey, JSON.stringify(localSettings))
  return localSettings
}

/* =========================================================================
 * 3. ENERGY LOGS
 * ========================================================================= */

function normalizeLog(row) {
  const gen = Math.max(0, Number(row.solar_generated_kwh ?? row.solar_generated) || 0)
  const con = Math.max(0, Number(row.total_consumption_kwh ?? row.consumption_kwh ?? row.electricity_consumed) || 0)
  let exp = Math.max(0, Number(row.grid_export_kwh ?? row.grid_exported) || 0)
  let imp = Math.max(0, Number(row.grid_import_kwh ?? row.grid_imported) || 0)
  const bChg = Math.max(0, Number(row.battery_charge_kwh) || 0)
  const bDis = Math.max(0, Number(row.battery_discharge_kwh) || 0)

  // Enforce physical bounds: export cannot exceed generation, import cannot exceed consumption
  if (exp > gen) exp = gen
  if (imp > con) imp = con

  // Derived or stored self consumption bounded safely within [0, min(gen, con)]
  let uti = Number(row.solar_utilized_kwh ?? row.solar_utilized)
  const rawSelfUsed = (bChg > 0 || bDis > 0)
    ? Math.min(gen - exp - bChg + bDis, con - imp)
    : Math.min(gen - exp, con - imp)

  if (isNaN(uti) || uti <= 0 || uti > gen || uti > con) {
    uti = parseFloat(Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed))).toFixed(2))
  } else {
    uti = parseFloat(Math.max(0, Math.min(gen, Math.min(con, uti))).toFixed(2))
  }

  const d = row.log_date || row.recorded_date || todayISO()

  return {
    id: String(row.id),
    user_id: row.user_id || null,
    log_date: d,
    recorded_date: d,
    solar_generated_kwh: gen,
    solar_generated: gen,
    total_consumption_kwh: con,
    consumption_kwh: con,
    electricity_consumed: con,
    solar_utilized_kwh: uti,
    solar_utilized: uti,
    grid_import_kwh: imp,
    grid_imported: imp,
    grid_export_kwh: exp,
    grid_exported: exp,
    battery_charge_kwh: bChg,
    battery_discharge_kwh: bDis,
    notes: row.notes || '',
    created_at: row.created_at || new Date().toISOString(),
  }
}

export async function getEnergyLogs(userId) {
  const userKey = resolveUserKey(userId)

  if (await localBackendReady()) {
    try {
      const rows = await api('/api/logs')
      return (Array.isArray(rows) ? rows : []).map(normalizeLog)
    } catch (err) {
      console.warn('[solarDataService] Local API logs read failed:', err.message)
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      const { data, error } = await supabase
        .from('energy_logs')
        .select('*')
        .eq('user_id', userId)
        .order('log_date', { ascending: false })

      if (!error && Array.isArray(data)) {
        const normalized = data.map(normalizeLog)
        localStorage.setItem(LOGS_PREFIX + userKey, JSON.stringify(normalized))
        return normalized
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to load energy logs from Supabase:', err)
    }
  }

  // Local fallback: returns empty array if never set (ZERO DEMO DATA)
  try {
    const raw = localStorage.getItem(LOGS_PREFIX + userKey)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeLog).sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
      }
    }
  } catch {}

  return []
}

export async function checkDuplicateLog(userId, logDate, excludeId = null) {
  const logs = await getEnergyLogs(userId)
  return logs.find((l) => l.log_date === logDate && l.id !== excludeId) || null
}

export async function saveEnergyLog(userId, logData) {
  const userKey = resolveUserKey(userId)
  const normalizedInput = normalizeLog(logData)

  const payload = {
    log_date: normalizedInput.log_date,
    solar_generated_kwh: normalizedInput.solar_generated_kwh,
    total_consumption_kwh: normalizedInput.total_consumption_kwh,
    solar_utilized_kwh: normalizedInput.solar_utilized_kwh,
    grid_import_kwh: normalizedInput.grid_import_kwh,
    grid_export_kwh: normalizedInput.grid_export_kwh,
    battery_charge_kwh: normalizedInput.battery_charge_kwh,
    battery_discharge_kwh: normalizedInput.battery_discharge_kwh,
    notes: normalizedInput.notes,
    updated_at: new Date().toISOString(),
  }

  if (await localBackendReady()) {
    try {
      const saved = await api('/api/logs', {
        method: 'POST',
        body: { ...payload, id: logData.id || undefined },
      })
      const res = normalizeLog(saved)
      syncLocalLogs(userKey, res)
      return res
    } catch (err) {
      console.warn('[solarDataService] Local API log save failed:', err.message)
      throw err
    }
  }

  if (isSupabaseConfigured && userId) {
    try {
      if (logData.id && !String(logData.id).startsWith('log_')) {
        const { data, error } = await supabase
          .from('energy_logs')
          .update(payload)
          .eq('id', logData.id)
          .select()
          .single()

        if (!error && data) {
          const res = normalizeLog(data)
          syncLocalLogs(userKey, res)
          return res
        }
      } else {
        const { data, error } = await supabase
          .from('energy_logs')
          .insert({ ...payload, user_id: userId })
          .select()
          .single()

        if (!error && data) {
          const res = normalizeLog(data)
          syncLocalLogs(userKey, res)
          return res
        }
      }
    } catch (err) {
      console.warn('[solarDataService] Failed to write energy log to Supabase:', err)
    }
  }

  // Local fallback
  const localLog = {
    id: logData.id || `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: userId || 'local',
    ...payload,
    created_at: logData.created_at || new Date().toISOString(),
  }
  syncLocalLogs(userKey, localLog)
  return localLog
}

function syncLocalLogs(userKey, log) {
  try {
    const raw = localStorage.getItem(LOGS_PREFIX + userKey)
    const logs = raw ? JSON.parse(raw) : []
    const idx = logs.findIndex((l) => l.id === log.id)
    let updated = []
    if (idx >= 0) {
      updated = [...logs]
      updated[idx] = log
    } else {
      updated = [log, ...logs]
    }
    updated.sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
    localStorage.setItem(LOGS_PREFIX + userKey, JSON.stringify(updated))
  } catch (err) {
    console.error('[solarDataService] Failed to sync local logs:', err)
  }
}

export async function deleteEnergyLog(userId, logId) {
  const userKey = resolveUserKey(userId)

  if (await localBackendReady()) {
    try {
      await api(`/api/logs/${encodeURIComponent(logId)}`, { method: 'DELETE' })
    } catch (err) {
      console.warn('[solarDataService] Local API log delete failed:', err.message)
      throw err
    }
  }

  if (isSupabaseConfigured && userId && !String(logId).startsWith('log_')) {
    try {
      const { error } = await supabase
        .from('energy_logs')
        .delete()
        .eq('id', logId)

      if (error) {
        console.warn('[solarDataService] Supabase delete error:', error.message)
      }
    } catch (err) {
      console.warn('[solarDataService] Supabase delete failed:', err)
    }
  }

  try {
    const raw = localStorage.getItem(LOGS_PREFIX + userKey)
    if (raw) {
      const logs = JSON.parse(raw)
      const filtered = logs.filter((l) => l.id !== logId)
      localStorage.setItem(LOGS_PREFIX + userKey, JSON.stringify(filtered))
    }
  } catch {}

  return true
}

export async function clearAllUserData(userId) {
  const userKey = resolveUserKey(userId)
  if (await localBackendReady()) {
    try {
      await api('/api/logs', { method: 'DELETE' })
    } catch (err) {
      console.warn('[solarDataService] Local API clear failed:', err.message)
    }
  }
  localStorage.removeItem(SETUP_PREFIX + userKey)
  localStorage.removeItem(SETTINGS_PREFIX + userKey)
  localStorage.removeItem(LOGS_PREFIX + userKey)

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('energy_logs').delete().eq('user_id', userId)
      await supabase.from('solar_systems').delete().eq('user_id', userId)
      await supabase.from('user_settings').delete().eq('user_id', userId)
    } catch {}
  }
}

/**
 * Presentation Demo Reset:
 * Completely resets all local storage records, energy logs, setups, and custom
 * judge credentials so tests and demos can start with a fresh slate.
 */
export async function resetAllDemoData(userId = null) {
  if (await localBackendReady()) {
    try {
      await api('/api/logs', { method: 'DELETE' })
      await api('/api/records', { method: 'DELETE' })
    } catch (err) {
      console.warn('[solarDataService] Local API reset failed:', err.message)
    }
  }

  // Clear all SolarConnect localStorage keys
  const keysToRemove = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.startsWith('solar_') || k.startsWith('solarconnect_'))) {
      keysToRemove.push(k)
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k))

  if (isSupabaseConfigured && userId) {
    try {
      await supabase.from('energy_logs').delete().eq('user_id', userId)
      await supabase.from('solar_systems').delete().eq('user_id', userId)
      await supabase.from('user_settings').delete().eq('user_id', userId)
    } catch {}
  }
}


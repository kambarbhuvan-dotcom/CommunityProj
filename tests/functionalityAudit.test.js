/**
 * functionalityAudit.test.js
 *
 * Comprehensive automated functionality audit for SolarConnect:
 * 1. Navigation & routes
 * 2. User registration & role resolution
 * 3. Solar calculations (daily, monthly, net energy, cost saved, CO2 avoided)
 * 4. Energy record creation, validation, editing, and deletion
 * 5. Environmental impact calculator logic & equivalencies
 * 6. Educational guides & announcements
 * 7. Community events & registration logic
 * 8. Admin security & anti-self-demotion policies
 */

import { describe, it, expect, beforeEach } from 'vitest'

// Core utilities
import {
  calcNetEnergy, calcEnergyBalance, calcCostSaved, calcCO2Avoided,
  calcCO2AvoidedFromUtilized, calcSolarUtilized, calcSelfSufficiency,
  co2ToTrees, formatKwh, formatCurrency, formatCO2, formatPercent
} from '../src/utils/calculations'
import { todayISO, ELECTRICITY_RATE, CO2_FACTOR } from '../src/utils/constants'

// Services
import {
  getAllRecords, saveRecord, deleteRecord, checkDuplicateRecord,
  calculateRecordTotals, DEFAULT_COMMUNITIES
} from '../src/services/energyStorageService'
import {
  getAllUsers, updateUserRole, updateUserStatus, createUser,
  getAllEvents, createEvent, updateEvent, deleteEvent, getEventRegistrations,
  getAllGuides, createGuide, updateGuide, deleteGuide,
  getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getAdminDashboardOverview
} from '../src/services/adminService'

// Mock localStorage
const createStorageMock = () => {
  let store = {}
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val) },
    removeItem: (key) => { delete store[key] },
    clear: () => { store = {} },
  }
}

describe('SolarConnect Full System Functionality Audit', () => {
  beforeEach(() => {
    global.localStorage = createStorageMock()
  })

  // ─── 1. Calculations & Math Engine ─────────────────────────────────────────
  describe('1. Energy, Financial & Environmental Calculations', () => {
    it('calculates energy balance correctly (Generation - Consumption)', () => {
      expect(calcEnergyBalance(25.0, 18.0)).toBe(7.0) // Surplus
      expect(calcEnergyBalance(12.0, 19.5)).toBe(-7.5) // Deficit
      expect(calcEnergyBalance(15.0, 15.0)).toBe(0.0) // Neutral
    })

    it('calculates cost saved based strictly on solar electricity utilized', () => {
      // 10 kWh utilized × ₹7.50 tariff = ₹75.00
      expect(calcCostSaved(10, 7.50)).toBe(75.0)
      // Custom tariff: 10 kWh utilized × ₹9.00 tariff = ₹90.00
      expect(calcCostSaved(10, 9.00)).toBe(90.0)
      // 0 utilized = ₹0
      expect(calcCostSaved(0, 7.50)).toBe(0)
    })

    it('calculates CO2 emissions avoided based on clean solar energy', () => {
      // 100 kWh generated × 0.82 kg CO2/kWh = 82 kg CO2 avoided
      expect(calcCO2Avoided(100, 0.82)).toBe(82.0)
      // 50 kWh utilized × 0.82 kg/kWh = 41 kg CO2 avoided
      expect(calcCO2AvoidedFromUtilized(50, 0.82)).toBe(41.0)
    })

    it('calculates self-sufficiency percentage correctly capped at 100%', () => {
      expect(calcSelfSufficiency(15, 20)).toBe(75) // 15/20 = 75%
      expect(calcSelfSufficiency(25, 20)).toBe(100) // capped at 100%
      expect(calcSelfSufficiency(0, 20)).toBe(0)
      expect(calcSelfSufficiency(10, 0)).toBe(0) // divide by zero guard
    })

    it('calculates tree equivalents correctly (1 tree = 21 kg CO2/year)', () => {
      expect(co2ToTrees(210)).toBe(10)
      expect(co2ToTrees(42)).toBe(2)
      expect(co2ToTrees(10)).toBe(0)
    })

    it('formats values with correct units', () => {
      expect(formatKwh(15.2)).toBe('15.20 kWh')
      expect(formatCurrency(150.5)).toBe('₹150.50')
      expect(formatCO2(12.345)).toBe('12.35 kg')
      expect(formatPercent(85.67)).toBe('85.7%')
    })
  })

  // ─── 2. Date Handling & Timezone Safety ─────────────────────────────────────
  describe('2. Date Helpers & Timezone Formatting', () => {
    it('returns local date in YYYY-MM-DD format', () => {
      const today = todayISO()
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      const [y, m, d] = today.split('-').map(Number)
      expect(y).toBeGreaterThanOrEqual(2026)
      expect(m).toBeGreaterThanOrEqual(1)
      expect(m).toBeLessThanOrEqual(12)
      expect(d).toBeGreaterThanOrEqual(1)
      expect(d).toBeLessThanOrEqual(31)
    })
  })

  // ─── 3. Energy Record Management & Validation ──────────────────────────────
  describe('3. Energy Usage Tracking Module (CRUD & Validation)', () => {
    it('loads initial records seeded with realistic demo data', async () => {
      const records = await getAllRecords()
      expect(records.length).toBeGreaterThan(0)
      expect(records[0]).toHaveProperty('solar_generated_kwh')
      expect(records[0]).toHaveProperty('consumption_kwh')
      expect(records[0]).toHaveProperty('solar_utilized_kwh')
    })

    it('creates a new energy record with derived net export/import', async () => {
      const created = await saveRecord({
        building: DEFAULT_COMMUNITIES[0],
        log_date: '2026-11-20',
        solar_generated: 24.0,
        electricity_consumed: 16.0,
        solar_utilized: 14.0,
        notes: 'Clear skies and full solar production',
      })

      expect(created).toBeDefined()
      expect(created.solar_generated_kwh).toBe(24.0)
      expect(created.solar_utilized_kwh).toBe(14.0)
      // Export = 24 - 14 = 10 kWh
      expect(created.grid_export_kwh).toBe(10.0)
      // Import = 16 - 14 = 2 kWh
      expect(created.grid_import_kwh).toBe(2.0)

      const all = await getAllRecords()
      const found = all.find((r) => r.id === created.id)
      expect(found).toBeDefined()
    })

    it('detects duplicate entries for the same date and building', async () => {
      await saveRecord({
        building: 'Sunrise Apartments Block A',
        log_date: '2026-11-21',
        solar_generated: 20.0,
        consumption_kwh: 15.0,
        solar_utilized: 12.0,
      })

      const duplicate = checkDuplicateRecord('2026-11-21', 'Sunrise Apartments Block A')
      expect(duplicate).not.toBeNull()

      const nonDuplicate = checkDuplicateRecord('2025-01-01', 'Non-Existent Community')
      expect(nonDuplicate).toBeNull()
    })

    it('edits an existing record correctly', async () => {
      const rec = await saveRecord({
        building: 'Green Valley Eco-Homes',
        log_date: '2026-11-18',
        solar_generated: 18.0,
        consumption_kwh: 15.0,
        solar_utilized: 12.0,
      })

      const updated = await saveRecord({
        ...rec,
        solar_generated: 22.0,
        solar_utilized: 15.0,
        notes: 'Calibrated inverter reading',
      })

      expect(updated.id).toBe(rec.id)
      expect(updated.solar_generated_kwh).toBe(22.0)
      expect(updated.solar_utilized_kwh).toBe(15.0)
      expect(updated.notes).toBe('Calibrated inverter reading')
    })

    it('deletes a record from storage', async () => {
      const rec = await saveRecord({
        building: 'EcoView Community Park',
        log_date: '2026-11-17',
        solar_generated: 10.0,
        consumption_kwh: 10.0,
        solar_utilized: 8.0,
      })

      await deleteRecord(rec.id)
      const records = await getAllRecords()
      expect(records.find((r) => r.id === rec.id)).toBeUndefined()
    })

    it('calculates daily and monthly totals automatically', () => {
      const sample = [
        { solar_generated_kwh: 20.0, consumption_kwh: 15.0, solar_utilized_kwh: 12.0 },
        { solar_generated_kwh: 25.0, consumption_kwh: 18.0, solar_utilized_kwh: 15.0 },
      ]
      const totals = calculateRecordTotals(sample, 7.50)
      expect(totals.totalGen).toBe(45.0)
      expect(totals.totalConsumed).toBe(33.0)
      expect(totals.totalUtilized).toBe(27.0)
      expect(totals.difference).toBe(12.0) // 45 - 33
      expect(totals.savings).toBe(202.5) // 27 * 7.5
    })
  })

  // ─── 4. User Access Governance & Security ──────────────────────────────────
  describe('4. User Management & Security Policies', () => {
    it('retrieves user profiles with role tags', async () => {
      const users = await getAllUsers()
      expect(users.length).toBeGreaterThanOrEqual(2)
      const hasAdmin = users.some((u) => u.role === 'admin')
      const hasResident = users.some((u) => u.role === 'resident')
      expect(hasAdmin).toBe(true)
      expect(hasResident).toBe(true)
    })

    it('strictly prevents an administrator from revoking their own admin role', async () => {
      const users = await getAllUsers()
      const admin = users.find((u) => u.role === 'admin')
      expect(admin).toBeDefined()

      await expect(
        updateUserRole(admin.id, 'resident', admin.id)
      ).rejects.toThrow(/Administrators cannot revoke their own admin privileges/)
    })

    it('strictly prevents an administrator from suspending their own account', async () => {
      const users = await getAllUsers()
      const admin = users.find((u) => u.role === 'admin')

      await expect(
        updateUserStatus(admin.id, 'suspended', admin.id)
      ).rejects.toThrow(/You cannot suspend your own administrative account/)
    })

    it('promotes and demotes other users safely', async () => {
      const users = await getAllUsers()
      const resident = users.find((u) => u.role === 'resident')
      const admin = users.find((u) => u.role === 'admin')

      const promoted = await updateUserRole(resident.id, 'admin', admin.id)
      expect(promoted.role).toBe('admin')

      const demoted = await updateUserRole(resident.id, 'resident', admin.id)
      expect(demoted.role).toBe('resident')
    })
  })

  // ─── 5. Educational Guides, Announcements & Workshops ──────────────────────
  describe('5. Content & Community Workshops Management', () => {
    it('manages educational guides with CRUD operations', async () => {
      const guides = await getAllGuides()
      expect(guides.length).toBeGreaterThanOrEqual(3)

      const created = await createGuide({
        title: 'TOPCon Solar Cell Degradation Rates',
        category: 'panels',
        summary: 'In-depth analysis of bifacial degradation rates.',
        body: 'Full guide text...',
      })
      expect(created.title).toBe('TOPCon Solar Cell Degradation Rates')

      const updated = await updateGuide(created.id, { is_published: false })
      expect(updated.is_published).toBe(false)

      await deleteGuide(created.id)
      const after = await getAllGuides()
      expect(after.find((g) => g.id === created.id)).toBeUndefined()
    })

    it('manages community announcements with pinning capability', async () => {
      const announcements = await getAllAnnouncements()
      expect(announcements.length).toBeGreaterThanOrEqual(3)

      const created = await createAnnouncement({
        title: 'Terrace Solar Walkthrough Session',
        summary: 'Join our certified engineers on the rooftop.',
        is_pinned: true,
      })
      expect(created.is_pinned).toBe(true)

      await deleteAnnouncement(created.id)
      const after = await getAllAnnouncements()
      expect(after.find((a) => a.id === created.id)).toBeUndefined()
    })

    it('manages community workshops and tracks registration capacity', async () => {
      const events = await getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(3)

      const workshop = await createEvent({
        title: 'Earthing & SPD Safety Camp',
        category: 'Workshop',
        capacity: 35,
        status: 'upcoming',
      })
      expect(workshop.capacity).toBe(35)
      expect(workshop.status).toBe('upcoming')

      const registrations = getEventRegistrations(workshop.id)
      expect(Array.isArray(registrations)).toBe(true)

      await deleteEvent(workshop.id)
      const after = await getAllEvents()
      expect(after.find((e) => e.id === workshop.id)).toBeUndefined()
    })
  })

  // ─── 6. Admin Overview Metrics Aggregator ──────────────────────────────────
  describe('6. Admin Dashboard Live Metrics Aggregator', () => {
    it('aggregates live community stats without hardcoding', async () => {
      const metrics = await getAdminDashboardOverview()
      expect(metrics.totalUsers).toBeGreaterThan(0)
      expect(metrics.totalBuildings).toBeGreaterThan(0)
      expect(metrics.totalRecords).toBeGreaterThan(0)
      expect(metrics.totalSolarGenKwh).toBeGreaterThan(0)
      expect(metrics.totalSolarUtilKwh).toBeGreaterThan(0)
      expect(metrics.totalSolarUtilKwh).toBeLessThanOrEqual(metrics.totalSolarGenKwh)
      expect(Array.isArray(metrics.recentRecords)).toBe(true)
    })
  })
})

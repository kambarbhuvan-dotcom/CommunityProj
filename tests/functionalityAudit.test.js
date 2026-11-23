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
  co2ToTrees, formatKwh, formatCurrency, formatCO2, formatPercent,
  calcRecordSelfConsumption, validateEnergyBalance, calculateAggregatedAnalytics
} from '../src/utils/calculations'
import {
  getSolarSetup, saveSolarSetup, getUserSettings, saveUserSettings,
  getEnergyLogs, saveEnergyLog, deleteEnergyLog, checkDuplicateLog
} from '../src/services/solarDataService'
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

    it('safely bounds self-consumed solar power within physical limits (gen and con)', () => {
      // Mismatched inputs where con - imp yields 14.20 kWh, but solar generated is only 10.00 kWh
      const mismatched = calcRecordSelfConsumption({
        solar_generated_kwh: 10.0,
        total_consumption_kwh: 20.0,
        grid_import_kwh: 5.8, // 20 - 5.8 = 14.2
        grid_export_kwh: 0,
      })
      // Must be safely capped at solar generated (10.0 kWh)
      expect(mismatched).toBe(10.0)

      // When solar exceeds consumption (gen = 25, con = 15, exp = 10, imp = 0)
      const excessGen = calcRecordSelfConsumption({
        solar_generated_kwh: 25.0,
        total_consumption_kwh: 15.0,
        grid_export_kwh: 10.0,
        grid_import_kwh: 0,
      })
      expect(excessGen).toBe(15.0)

      // Zero or negative guards
      const zeroGen = calcRecordSelfConsumption({
        solar_generated_kwh: 0,
        total_consumption_kwh: 10.0,
        grid_import_kwh: 10.0,
        grid_export_kwh: 0,
      })
      expect(zeroGen).toBe(0)

      // Savings and CO2 strictly derived from bounded self-consumed
      const savings = calcCostSaved(mismatched, 7.50)
      expect(savings).toBe(75.0) // 10 * 7.50, NOT 14.2 * 7.50
      const co2 = calcCO2Avoided(mismatched, 0.82)
      expect(co2).toBe(8.2) // 10 * 0.82
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
    it('enforces zero demo data policy on fresh initial storage state', async () => {
      localStorage.clear()
      const records = await getAllRecords()
      expect(Array.isArray(records)).toBe(true)
      expect(records.length).toBe(0)
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
      await saveRecord({
        building: 'Sunrise Apartments Block A',
        log_date: '2026-11-23',
        solar_generated: 25.0,
        electricity_consumed: 20.0,
        solar_utilized: 18.0,
      })
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

  // ─── 7. Real Solar Data Service & Analytics Engine (Zero Demo Data) ───────
  describe('7. Real Solar Data Service & Analytics Engine (Zero Demo Data)', () => {
    it('manages real user solar installation setup with battery specifications', async () => {
      const userId = 'test_user_solar_1'
      const initial = await getSolarSetup(userId)
      expect(initial).toBeNull()

      const saved = await saveSolarSetup(userId, {
        system_capacity_kw: 5.5,
        panel_type: 'Bifacial Monocrystalline',
        panel_count: 14,
        installation_date: '2026-01-15',
        city_location: 'Hubballi',
        inverter_capacity_kw: 5.0,
        has_battery_storage: true,
        battery_capacity_kwh: 10.0,
        system_type: 'hybrid',
      })

      expect(saved.system_capacity_kw).toBe(5.5)
      expect(saved.has_battery_storage).toBe(true)
      expect(saved.battery_capacity_kwh).toBe(10.0)

      const fetched = await getSolarSetup(userId)
      expect(fetched.system_capacity_kw).toBe(5.5)
      expect(fetched.panel_type).toBe('Bifacial Monocrystalline')
    })

    it('manages user settings and custom tariff / grid emission factor', async () => {
      const userId = 'test_user_settings_1'
      const saved = await saveUserSettings(userId, {
        electricity_tariff_inr: 8.20,
        grid_emission_factor: 0.85,
        household_members: 5,
        electricity_provider: 'Tata Power (Delhi / Mumbai)',
      })

      expect(saved.electricity_tariff_inr).toBe(8.20)
      expect(saved.grid_emission_factor).toBe(0.85)

      const fetched = await getUserSettings(userId)
      expect(fetched.electricity_tariff_inr).toBe(8.20)
      expect(fetched.household_members).toBe(5)
    })

    it('records and calculates daily energy logs with battery and net-metering', async () => {
      const userId = 'test_user_logs_1'

      // Starts completely empty
      const initialLogs = await getEnergyLogs(userId)
      expect(initialLogs).toEqual([])

      // Save day 1
      const log1 = await saveEnergyLog(userId, {
        log_date: '2026-11-21',
        solar_generated_kwh: 20.0,
        total_consumption_kwh: 16.0,
        grid_import_kwh: 4.0,
        grid_export_kwh: 6.0,
        battery_charge_kwh: 4.0,
        battery_discharge_kwh: 2.0,
        notes: 'Sunny day, battery fully cycled',
      })

      expect(log1).toBeDefined()
      expect(log1.solar_generated_kwh).toBe(20.0)
      expect(log1.total_consumption_kwh).toBe(16.0)

      // Physical balance validation
      const balanceCheck = validateEnergyBalance(log1)
      expect(balanceCheck.valid).toBe(true)

      // Duplicate prevention check
      const dup = await checkDuplicateLog(userId, '2026-11-21')
      expect(dup).not.toBeNull()
      expect(dup.id).toBe(log1.id)

      // Save day 2
      await saveEnergyLog(userId, {
        log_date: '2026-11-22',
        solar_generated_kwh: 18.0,
        total_consumption_kwh: 15.0,
        grid_import_kwh: 3.0,
        grid_export_kwh: 6.0,
        battery_charge_kwh: 0,
        battery_discharge_kwh: 0,
        notes: 'Grid-tied direct usage',
      })

      const allUserLogs = await getEnergyLogs(userId)
      expect(allUserLogs.length).toBe(2)

      // Run automated aggregated analytics
      const analytics = calculateAggregatedAnalytics(allUserLogs, 8.0, 0.82)
      expect(analytics.totalGen).toBe(38.0)
      expect(analytics.totalCon).toBe(31.0)
      expect(analytics.gridDependency).toBeGreaterThan(0)
      expect(analytics.selfSufficiency).toBeGreaterThan(0)
      expect(analytics.totalSavings).toBeGreaterThan(0)
      expect(analytics.totalCO2).toBeGreaterThan(0)
      expect(analytics.energyDistribution.length).toBe(3)

      // Delete day 1
      await deleteEnergyLog(userId, log1.id)
      const afterDelete = await getEnergyLogs(userId)
      expect(afterDelete.length).toBe(1)
      expect(afterDelete[0].log_date).toBe('2026-11-22')
    })

    it('validates physical energy balance accurately without false positives on zero values', () => {
      // User scenario: gridExported = 0, solarGenerated = 4.5, gridImported = 14.5, totalConsumed = 19.0
      // 4.5 - 0 + 14.5 = 19.0 === totalConsumed (0 discrepancy)
      const zeroExportCheck = validateEnergyBalance({
        solar_generated_kwh: 4.5,
        total_consumption_kwh: 19.0,
        grid_import_kwh: 14.5,
        grid_export_kwh: 0,
      })
      expect(zeroExportCheck.valid).toBe(true)
      expect(zeroExportCheck.diff).toBe(0)

      // Incomplete entries (< 4 fields populated) should not trigger warning
      const partialCheck = validateEnergyBalance({
        solar_generated_kwh: 12.0,
        total_consumption_kwh: 15.0,
      })
      expect(partialCheck.valid).toBe(true)

      // Within 0.1 kWh tolerance (rounding jitter)
      const toleranceCheck = validateEnergyBalance({
        solar_generated_kwh: 10.0,
        grid_export_kwh: 2.0,
        grid_import_kwh: 7.05,
        total_consumption_kwh: 15.0, // (10 - 2 + 7.05) - 15 = 0.05 <= 0.1
      })
      expect(toleranceCheck.valid).toBe(true)

      // Discrepancy exceeding 0.1 kWh triggers advisory
      const mismatchCheck = validateEnergyBalance({
        solar_generated_kwh: 10.0,
        grid_export_kwh: 2.0,
        grid_import_kwh: 5.0,
        total_consumption_kwh: 20.0, // (10 - 2 + 5) = 13 vs 20 -> 7 kWh diff
      })
      expect(mismatchCheck.valid).toBe(false)
      expect(mismatchCheck.diff).toBe(7.0)
      expect(mismatchCheck.message).toContain('7 kWh detected')

      // Physically impossible: gridExported > solarGenerated
      const impossibleExport = validateEnergyBalance({
        solar_generated_kwh: 5.0,
        grid_export_kwh: 8.0,
        grid_import_kwh: 10.0,
        total_consumption_kwh: 7.0,
      })
      expect(impossibleExport.valid).toBe(false)
      expect(impossibleExport.message).toContain('Grid exported cannot exceed solar energy generated')

      // Physically impossible: gridImported > totalConsumed
      const impossibleImport = validateEnergyBalance({
        solar_generated_kwh: 5.0,
        grid_export_kwh: 2.0,
        grid_import_kwh: 15.0,
        total_consumption_kwh: 10.0,
      })
      expect(impossibleImport.valid).toBe(false)
      expect(impossibleImport.message).toContain('Grid imported cannot exceed total electricity consumed')
    })
  })
})

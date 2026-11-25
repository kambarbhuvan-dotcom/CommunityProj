/**
 * calculations.js
 *
<<<<<<< HEAD
 * All solar energy calculations live here — never inline them in components.
 * This makes the math easy to find, test, and change in one place.
 *
 * KEY RULES:
 *   Energy Balance = Generation - Consumption
 *   Estimated Savings = Solar energy utilized × configurable electricity tariff
 *   Estimated CO2 reduction = Solar electricity generated × configurable emission factor
=======
 * Automated Solar Energy Calculations Engine
 *
 * Implements strict, mathematically verified solar analytics:
 * - Solar Energy Generation: Daily, Weekly, Monthly, Yearly, Total
 * - Electricity Consumption: Daily, Weekly, Monthly, Yearly, Average Daily
 * - Solar Self-Consumption: Direct use + Battery discharge (no double-counting)
 * - Grid Dependency (%): (Grid Electricity Imported / Total Electricity Consumed) * 100
 * - Solar Self-Sufficiency (%): (Solar Electricity Utilized / Total Electricity Consumed) * 100 (capped at 100%)
 * - Electricity Bill Savings: Self-Consumed Solar Energy * Electricity Tariff
 * - CO₂ Emissions Avoided: Grid Electricity Displaced * Grid Emission Factor
 * - Energy Export: Daily, Monthly, Total Exported, and Export Percentage
 * - Energy Balance Validation & Discrepancy Warnings
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
 */

import { ELECTRICITY_RATE, CO2_FACTOR } from './constants'

<<<<<<< HEAD
// ─── Core derivation ──────────────────────────────────────────────────────

/**
 * Calculates solar energy actually used inside the home.
 * @param {number} generatedKwh  - Total solar panel output (kWh)
 * @param {number} exportedKwh   - Energy exported to the grid (kWh), default 0
 * @returns {number} kWh of solar consumed in-home
=======
// ─── 1. Single Record Derivations ──────────────────────────────────────────

/**
 * Calculates solar self-consumption for a single log record.
 * Takes battery charge and discharge into account correctly without double-counting.
 *
 * Generation balance:
 *   Solar Generated = Solar Directly Consumed + Grid Export + Battery Charge
 * Consumption balance:
 *   Total Consumed = Solar Directly Consumed + Battery Discharge + Grid Import
 *
 * @param {Object} record
 * @returns {number} kWh of solar power utilized by the household
 */
export function calcRecordSelfConsumption(record = {}) {
  const gen = Math.max(0, Number(record.solar_generated_kwh ?? record.solar_generated) || 0)
  const con = Math.max(0, Number(record.total_consumption_kwh ?? record.consumption_kwh ?? record.electricity_consumed) || 0)
  const exp = Math.max(0, Number(record.grid_export_kwh ?? record.grid_exported) || 0)
  const imp = Math.max(0, Number(record.grid_import_kwh ?? record.grid_imported) || 0)
  const charge = Math.max(0, Number(record.battery_charge_kwh) || 0)
  const discharge = Math.max(0, Number(record.battery_discharge_kwh) || 0)

  // Explicit solar_utilized field if already measured/stored - safely clamp within physical boundaries [0, min(gen, con)]
  if (record.solar_utilized_kwh !== undefined && record.solar_utilized_kwh !== null && record.solar_utilized_kwh !== '') {
    const directVal = Number(record.solar_utilized_kwh)
    if (!isNaN(directVal)) {
      return parseFloat(Math.max(0, Math.min(gen, Math.min(con, directVal))).toFixed(2))
    }
  }

  // Calculate self-consumed solar power safely bounded within physical limits
  const rawSelfUsed = (charge > 0 || discharge > 0)
    ? Math.min(gen - exp - charge + discharge, con - imp)
    : Math.min(gen - exp, con - imp)

  const selfUsed = Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed)))
  return parseFloat(selfUsed.toFixed(2))
}

/**
 * Calculates solar energy utilized inside the home.
 * Alias for calcRecordSelfConsumption for backward compatibility.
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
 */
export function calcSolarUtilized(generatedKwh, exportedKwh = 0) {
  const gen = Number(generatedKwh) || 0
  const exp = Number(exportedKwh) || 0
  return Math.max(0, gen - exp)
}

/**
 * Fallback: estimate solar utilized when export data is not available.
<<<<<<< HEAD
 * @param {number} generatedKwh
 * @param {number} consumptionKwh
 * @returns {number}
=======
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
 */
export function estimateSolarUtilized(generatedKwh, consumptionKwh) {
  const gen = Number(generatedKwh) || 0
  const con = Number(consumptionKwh) || 0
  return Math.min(gen, con)
}

<<<<<<< HEAD
// ─── Financial calculations ───────────────────────────────────────────────

/**
 * Money saved by not buying grid electricity for in-home solar consumption.
 * @param {number} utilizedKwh - Solar energy used inside the home (kWh)
 * @param {number} [tariff] - Configurable electricity tariff in ₹/kWh (default ELECTRICITY_RATE)
 * @returns {number} Savings in ₹
 */
export function calcCostSaved(utilizedKwh, tariff = ELECTRICITY_RATE) {
  const rate = Number(tariff) > 0 ? Number(tariff) : ELECTRICITY_RATE
  return (Number(utilizedKwh) || 0) * rate
}

/**
 * Rough estimate of payback period for a solar system.
 * @param {number} systemCostRs    - Total installation cost in ₹
 * @param {number} monthlySavingsRs - Average monthly savings in ₹
 * @returns {number} Months to break even (Infinity if savings is 0)
 */
export function calcPaybackMonths(systemCostRs, monthlySavingsRs) {
  const savings = Number(monthlySavingsRs) || 0
  if (savings <= 0) return Infinity
  return Math.ceil(Number(systemCostRs) / savings)
}

// ─── Energy balance ───────────────────────────────────────────────────────

/**
 * Net energy balance: Generation - Consumption
 * Positive = surplus generated beyond consumption
 * Negative = deficit (grid import was needed)
 * @param {number} generatedKwh
 * @param {number} consumedKwh
 * @returns {number}
 */
export function calcNetEnergy(generatedKwh, consumedKwh) {
  return (Number(generatedKwh) || 0) - (Number(consumedKwh) || 0)
}

export const calcEnergyBalance = calcNetEnergy

/**
 * Percentage of consumption met by solar (capped at 100%).
 * Uses solar_utilized — not total generation — for accuracy.
 * @param {number} utilizedKwh   - Solar used in-home
 * @param {number} consumedKwh   - Total consumption
 * @returns {number} 0–100
 */
export function calcSelfSufficiency(utilizedKwh, consumedKwh) {
  const consumed = Number(consumedKwh) || 0
  if (consumed === 0) return 0
  const utilized = Number(utilizedKwh) || 0
  return Math.min((utilized / consumed) * 100, 100)
}

/**
 * Percentage of consumption that came from the grid.
 * @param {number} gridImportKwh
 * @param {number} consumedKwh
 * @returns {number} 0–100
 */
export function calcGridDependency(gridImportKwh, consumedKwh) {
  const consumed = Number(consumedKwh) || 0
  if (consumed === 0) return 0
  return Math.min(((Number(gridImportKwh) || 0) / consumed) * 100, 100)
}

// ─── Environmental impact ─────────────────────────────────────────────────

/**
 * CO₂ emissions avoided by generating clean solar electricity.
 * Uses total generation × configurable emission factor.
 * @param {number} generatedKwh
 * @param {number} [emissionFactor] - Configurable kg CO₂/kWh (default CO2_FACTOR)
 * @returns {number} kg of CO₂ avoided
 */
export function calcCO2Avoided(generatedKwh, emissionFactor = CO2_FACTOR) {
  const factor = Number(emissionFactor) > 0 ? Number(emissionFactor) : CO2_FACTOR
  return (Number(generatedKwh) || 0) * factor
}

/**
 * CO₂ emissions avoided based strictly on solar utilized (displaced grid energy).
 * @param {number} utilizedKwh
 * @param {number} [emissionFactor]
 * @returns {number}
 */
export function calcCO2AvoidedFromUtilized(utilizedKwh, emissionFactor = CO2_FACTOR) {
  const factor = Number(emissionFactor) > 0 ? Number(emissionFactor) : CO2_FACTOR
  return (Number(utilizedKwh) || 0) * factor
}

/**
 * Rough equivalent in trees planted (1 tree absorbs ~21 kg CO₂/year).
 * @param {number} co2KgAvoided
 * @returns {number}
=======
// ─── 2. Financial & Environmental Derivations ─────────────────────────────

/**
 * Estimated monetary savings derived from solar electricity replacing grid electricity.
 * Formula: Self-Consumed Solar Energy × Electricity Tariff
 *
 * @param {number} selfConsumedKwh - Solar electricity used inside the home (kWh)
 * @param {number} [tariff] - Configurable electricity tariff in ₹/kWh
 * @returns {number} Estimated savings in ₹
 */
export function calcCostSaved(selfConsumedKwh, tariff = ELECTRICITY_RATE) {
  const rate = Number(tariff) > 0 ? Number(tariff) : ELECTRICITY_RATE
  const kwh = Number(selfConsumedKwh) || 0
  return parseFloat((kwh * rate).toFixed(2))
}

/**
 * Estimated CO₂ emissions avoided from grid power displaced by solar electricity.
 * Formula: Displaced Grid Electricity × Grid Emission Factor
 *
 * @param {number} displacedKwh - Solar electricity displacing grid power (kWh)
 * @param {number} [emissionFactor] - Configurable emission factor in kg CO₂/kWh (default: 0.82)
 * @returns {number} kg of CO₂ avoided
 */
export function calcCO2Avoided(displacedKwh, emissionFactor = CO2_FACTOR) {
  const factor = Number(emissionFactor) > 0 ? Number(emissionFactor) : CO2_FACTOR
  const kwh = Number(displacedKwh) || 0
  return parseFloat((kwh * factor).toFixed(2))
}

export const calcCO2AvoidedFromUtilized = calcCO2Avoided

/**
 * Rough equivalent in mature trees planted (1 adult tree absorbs ~21 kg CO₂/year).
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
 */
export function co2ToTrees(co2KgAvoided) {
  return Math.round((Number(co2KgAvoided) || 0) / 21)
}

<<<<<<< HEAD
// ─── Formatters ───────────────────────────────────────────────────────────

/** Format a kWh value to 2 decimal places with unit */
export function formatKwh(val) {
  return `${(Number(val) || 0).toFixed(2)} kWh`
}

/** Format a CO₂ value to 2 decimal places with unit */
export function formatCO2(val) {
  return `${(Number(val) || 0).toFixed(2)} kg`
}

/** Format a currency value in ₹ to 2 decimal places */
export function formatCurrency(val) {
  return `₹${(Number(val) || 0).toFixed(2)}`
}

/** Format a percentage value to 1 decimal place */
export function formatPercent(val) {
  return `${(Number(val) || 0).toFixed(1)}%`
=======
// ─── 3. Grid Dependency & Solar Self-Sufficiency ──────────────────────────

/**
 * Grid Dependency Percentage:
 * Grid Dependency (%) = (Grid Electricity Imported / Total Electricity Consumed) * 100
 *
 * @param {number} gridImportKwh
 * @param {number} totalConsumedKwh
 * @returns {number} 0–100 %
 */
export function calcGridDependency(gridImportKwh, totalConsumedKwh) {
  const con = Number(totalConsumedKwh) || 0
  if (con <= 0) return 0
  const imp = Math.max(0, Number(gridImportKwh) || 0)
  return Math.min(100, parseFloat(((imp / con) * 100).toFixed(1)))
}

/**
 * Solar Self-Sufficiency Percentage:
 * Solar Self-Sufficiency (%) = (Solar Electricity Utilized / Total Electricity Consumed) * 100
 * Capped at 100%.
 *
 * @param {number} solarUtilizedKwh
 * @param {number} totalConsumedKwh
 * @returns {number} 0–100 %
 */
export function calcSelfSufficiency(solarUtilizedKwh, totalConsumedKwh) {
  const con = Number(totalConsumedKwh) || 0
  if (con <= 0) return 0
  const uti = Math.max(0, Number(solarUtilizedKwh) || 0)
  return Math.min(100, parseFloat(((uti / con) * 100).toFixed(1)))
}

/**
 * Energy Balance: Generation - Consumption
 * Positive = Net energy surplus
 * Negative = Net energy deficit
 */
export function calcNetEnergy(generatedKwh, consumedKwh) {
  return parseFloat(((Number(generatedKwh) || 0) - (Number(consumedKwh) || 0)).toFixed(2))
}

export const calcEnergyBalance = calcNetEnergy

/**
 * Solar Export Percentage:
 * Export (%) = (Grid Electricity Exported / Total Solar Generated) * 100
 */
export function calcExportPercentage(exportedKwh, generatedKwh) {
  const gen = Number(generatedKwh) || 0
  if (gen <= 0) return 0
  const exp = Math.max(0, Number(exportedKwh) || 0)
  return Math.min(100, parseFloat(((exp / gen) * 100).toFixed(1)))
}

// ─── 4. Energy Balance Validator ──────────────────────────────────────────

/**
 * Validates logical consistency of an energy record.
 * Energy Input: Solar Generated + Grid Import + Battery Discharge
 * Energy Output: Total Consumed + Grid Export + Battery Charge
 *
 * @param {Object} record
 * @returns {Object} { isValid, isWarning, discrepancyKwh, message }
 */
export function validateEnergyBalance(record = {}) {
  const isPopulated = (val) => val !== '' && val !== null && val !== undefined && !Number.isNaN(Number(val))

  const genVal = record.solar_generated_kwh ?? record.solar_generated
  const conVal = record.total_consumption_kwh ?? record.consumption_kwh ?? record.electricity_consumed
  const impVal = record.grid_import_kwh ?? record.grid_imported
  const expVal = record.grid_export_kwh ?? record.grid_exported

  // Check if all 4 primary meter fields are populated
  const hasAll4 = isPopulated(genVal) && isPopulated(conVal) && isPopulated(impVal) && isPopulated(expVal)

  if (!hasAll4) {
    return {
      valid: true,
      isValid: true,
      isWarning: false,
      diff: 0,
      discrepancyKwh: 0,
      message: null,
    }
  }

  const gen = Number(genVal)
  const con = Number(conVal)
  const imp = Number(impVal)
  const exp = Number(expVal)
  const bCharge = isPopulated(record.battery_charge_kwh) ? Number(record.battery_charge_kwh) : 0
  const bDischarge = isPopulated(record.battery_discharge_kwh) ? Number(record.battery_discharge_kwh) : 0

  // Direct physical rule checks
  if (exp > gen) {
    const d = parseFloat((exp - gen).toFixed(2))
    return {
      valid: false,
      isValid: false,
      isWarning: true,
      diff: d,
      discrepancyKwh: d,
      message: `Grid exported cannot exceed solar energy generated.`,
    }
  }

  if (imp > con) {
    const d = parseFloat((imp - con).toFixed(2))
    return {
      valid: false,
      isValid: false,
      isWarning: true,
      diff: d,
      discrepancyKwh: d,
      message: `Grid imported cannot exceed total electricity consumed.`,
    }
  }

  // Energy balance verification: (gen - exp - bCharge + imp + bDischarge) vs con
  const netEnergyFlow = (gen - exp - bCharge + imp + bDischarge)
  const diff = Math.abs(netEnergyFlow - con)

  // Only trigger physical balance advisory when discrepancy exceeds 0.1 kWh rounding tolerance
  if (diff > 0.1) {
    const formattedDiff = parseFloat(diff.toFixed(2))
    return {
      valid: false,
      isValid: true,
      isWarning: true,
      diff: formattedDiff,
      discrepancyKwh: formattedDiff,
      message: `Energy balance discrepancy of ${formattedDiff} kWh detected. Inputs (Solar Gen ${gen} kWh - Export ${exp} kWh + Import ${imp} kWh = ${(gen - exp + imp).toFixed(2)} kWh) do not match Total Consumption (${con.toFixed(2)} kWh).`,
    }
  }

  return {
    valid: true,
    isValid: true,
    isWarning: false,
    diff: 0,
    discrepancyKwh: 0,
    message: null,
  }
}

// ─── 5. Date Filtering Utility ────────────────────────────────────────────

/**
 * Filters energy logs according to selected date range filter.
 *
 * Supported range keys:
 * - '7days'     : Last 7 days
 * - '30days'    : Last 30 days
 * - '3months'   : Last 90 days
 * - '6months'   : Last 180 days
 * - 'thisYear'  : Current calendar year (Jan 1 to today)
 * - 'custom'    : Custom start & end date
 * - 'all'       : All records
 *
 * @param {Array} records
 * @param {string} rangeKey
 * @param {string} [customStart]
 * @param {string} [customEnd]
 * @returns {Array} Filtered records sorted chronologically ascending
 */
export function filterRecordsByDateRange(records = [], rangeKey = '30days', customStart = null, customEnd = null) {
  if (!Array.isArray(records) || records.length === 0) return []

  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)

  let startDate = null
  let endDate = todayStr

  if (rangeKey === 'today') {
    startDate = todayStr
  } else if (rangeKey === '7days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 6)
    startDate = d.toISOString().slice(0, 10)
  } else if (rangeKey === '30days') {
    const d = new Date(now)
    d.setDate(d.getDate() - 29)
    startDate = d.toISOString().slice(0, 10)
  } else if (rangeKey === '3months') {
    const d = new Date(now)
    d.setDate(d.getDate() - 89)
    startDate = d.toISOString().slice(0, 10)
  } else if (rangeKey === '6months') {
    const d = new Date(now)
    d.setDate(d.getDate() - 179)
    startDate = d.toISOString().slice(0, 10)
  } else if (rangeKey === 'thisYear') {
    startDate = `${now.getFullYear()}-01-01`
  } else if (rangeKey === 'custom') {
    startDate = customStart || '1970-01-01'
    endDate = customEnd || todayStr
  } else if (rangeKey === 'all') {
    startDate = null
  }

  return records
    .filter((r) => {
      const d = r.log_date || r.recorded_date
      if (!d) return false
      if (startDate && d < startDate) return false
      if (endDate && d > endDate) return false
      return true
    })
    .sort((a, b) => (a.log_date || a.recorded_date).localeCompare(b.log_date || b.recorded_date))
}

// ─── 6. Comprehensive Analytics Aggregator ────────────────────────────────

/**
 * Calculates all required solar metrics from a list of records.
 *
 * Metrics provided:
 * 1. Total Solar Generation (kWh)
 * 2. Total Household Consumption (kWh)
 * 3. Solar Self-Consumption (kWh)
 * 4. Grid Dependency (%)
 * 5. Estimated Electricity Savings (₹)
 * 6. Estimated CO₂ Avoided (kg & tonnes)
 * 7. Energy Exported (kWh & %)
 * 8. Solar Self-Sufficiency (%)
 *
 * Time-breakdowns (Daily, Weekly, Monthly, Yearly, Total)
 * Energy distribution (Self-consumed, Exported, Grid Imported)
 *
 * @param {Array} records - List of energy log records
 * @param {number} [tariff] - Electricity tariff in ₹/kWh
 * @param {number} [emissionFactor] - Grid emission factor in kg CO₂/kWh
 * @returns {Object|null} Aggregated analytics or null if no records
 */
export function calculateAggregatedAnalytics(records = [], tariff = ELECTRICITY_RATE, emissionFactor = CO2_FACTOR) {
  if (!Array.isArray(records) || records.length === 0) {
    return null
  }

  const effectiveTariff = Number(tariff) > 0 ? Number(tariff) : ELECTRICITY_RATE
  const effectiveFactor = Number(emissionFactor) > 0 ? Number(emissionFactor) : CO2_FACTOR

  let totalGen = 0
  let totalCon = 0
  let totalImp = 0
  let totalExp = 0
  let totalSelfConsumed = 0
  let totalCharge = 0
  let totalDischarge = 0

  const dailyEntries = {}

  records.forEach((r) => {
    const d = r.log_date || r.recorded_date
    const gen = Math.max(0, Number(r.solar_generated_kwh ?? r.solar_generated) || 0)
    const con = Math.max(0, Number(r.total_consumption_kwh ?? r.consumption_kwh ?? r.electricity_consumed) || 0)
    const imp = Math.max(0, Number(r.grid_import_kwh) || 0)
    const exp = Math.max(0, Number(r.grid_export_kwh) || 0)
    const charge = Math.max(0, Number(r.battery_charge_kwh) || 0)
    const discharge = Math.max(0, Number(r.battery_discharge_kwh) || 0)

    const selfConsumed = calcRecordSelfConsumption(r)

    totalGen += gen
    totalCon += con
    totalImp += imp
    totalExp += exp
    totalSelfConsumed += selfConsumed
    totalCharge += charge
    totalDischarge += discharge

    if (d) {
      dailyEntries[d] = {
        date: d,
        gen,
        con,
        imp,
        exp,
        selfConsumed,
        diff: calcNetEnergy(gen, con),
        savings: calcCostSaved(selfConsumed, effectiveTariff),
        co2: calcCO2Avoided(selfConsumed, effectiveFactor),
      }
    }
  })

  const distinctDays = Math.max(1, Object.keys(dailyEntries).length)

  // 1. Core Totals
  const totalSavings = calcCostSaved(totalSelfConsumed, effectiveTariff)
  const totalCO2Avoided = calcCO2Avoided(totalSelfConsumed, effectiveFactor)
  const gridDependency = calcGridDependency(totalImp, totalCon)
  const selfSufficiency = calcSelfSufficiency(totalSelfConsumed, totalCon)
  const exportPercentage = calcExportPercentage(totalExp, totalGen)
  const netEnergyBalance = calcNetEnergy(totalGen, totalCon)

  // 2. Daily Averages
  const avgDailyGen = parseFloat((totalGen / distinctDays).toFixed(2))
  const avgDailyCon = parseFloat((totalCon / distinctDays).toFixed(2))
  const avgDailySelfConsumed = parseFloat((totalSelfConsumed / distinctDays).toFixed(2))
  const avgDailySavings = parseFloat((totalSavings / distinctDays).toFixed(2))
  const avgDailyCO2 = parseFloat((totalCO2Avoided / distinctDays).toFixed(2))

  // 3. Time Windows (Daily, Weekly, Monthly, Yearly, Total)
  const sortedDays = Object.keys(dailyEntries).sort()
  const latestDate = sortedDays[sortedDays.length - 1]
  const latestDay = latestDate ? dailyEntries[latestDate] : null

  // Weekly (last 7 recorded days)
  const last7Days = sortedDays.slice(-7)
  const weeklyGen = last7Days.reduce((acc, d) => acc + dailyEntries[d].gen, 0)
  const weeklyCon = last7Days.reduce((acc, d) => acc + dailyEntries[d].con, 0)
  const weeklySelfConsumed = last7Days.reduce((acc, d) => acc + dailyEntries[d].selfConsumed, 0)
  const weeklySavings = calcCostSaved(weeklySelfConsumed, effectiveTariff)
  const weeklyCO2 = calcCO2Avoided(weeklySelfConsumed, effectiveFactor)

  // Monthly (last 30 recorded days)
  const last30Days = sortedDays.slice(-30)
  const monthlyGen = last30Days.reduce((acc, d) => acc + dailyEntries[d].gen, 0)
  const monthlyCon = last30Days.reduce((acc, d) => acc + dailyEntries[d].con, 0)
  const monthlySelfConsumed = last30Days.reduce((acc, d) => acc + dailyEntries[d].selfConsumed, 0)
  const monthlySavings = calcCostSaved(monthlySelfConsumed, effectiveTariff)
  const monthlyCO2 = calcCO2Avoided(monthlySelfConsumed, effectiveFactor)
  const monthlyExp = last30Days.reduce((acc, d) => acc + dailyEntries[d].exp, 0)

  // Yearly (current calendar year or 365 days)
  const currentYear = new Date().getFullYear().toString()
  const thisYearDays = sortedDays.filter((d) => d.startsWith(currentYear))
  const yearlyGen = thisYearDays.length > 0 ? thisYearDays.reduce((acc, d) => acc + dailyEntries[d].gen, 0) : totalGen
  const yearlyCon = thisYearDays.length > 0 ? thisYearDays.reduce((acc, d) => acc + dailyEntries[d].con, 0) : totalCon
  const yearlySelfConsumed = thisYearDays.length > 0 ? thisYearDays.reduce((acc, d) => acc + dailyEntries[d].selfConsumed, 0) : totalSelfConsumed
  const yearlySavings = calcCostSaved(yearlySelfConsumed, effectiveTariff)
  const yearlyCO2 = calcCO2Avoided(yearlySelfConsumed, effectiveFactor)

  // 4. Energy Distribution Breakdown
  const totalFlow = totalSelfConsumed + totalExp + totalImp
  const distribution = {
    selfConsumedKwh: parseFloat(totalSelfConsumed.toFixed(2)),
    exportedKwh: parseFloat(totalExp.toFixed(2)),
    gridImportKwh: parseFloat(totalImp.toFixed(2)),
    selfConsumedPct: totalFlow > 0 ? parseFloat(((totalSelfConsumed / totalFlow) * 100).toFixed(1)) : 0,
    exportedPct: totalFlow > 0 ? parseFloat(((totalExp / totalFlow) * 100).toFixed(1)) : 0,
    gridImportPct: totalFlow > 0 ? parseFloat(((totalImp / totalFlow) * 100).toFixed(1)) : 0,
  }

  const energyDistribution = [
    { name: 'Self-Consumed', value: parseFloat(totalSelfConsumed.toFixed(2)) },
    { name: 'Grid Exported', value: parseFloat(totalExp.toFixed(2)) },
    { name: 'Grid Imported', value: parseFloat(totalImp.toFixed(2)) },
  ]

  // Monthly aggregated series for charts
  const monthMap = {}
  sortedDays.forEach((d) => {
    const m = d.substring(0, 7)
    if (!monthMap[m]) {
      monthMap[m] = { month: m, solar_generated_kwh: 0, consumption_kwh: 0, solar_utilized_kwh: 0, savings: 0 }
    }
    monthMap[m].solar_generated_kwh = parseFloat((monthMap[m].solar_generated_kwh + dailyEntries[d].gen).toFixed(2))
    monthMap[m].consumption_kwh = parseFloat((monthMap[m].consumption_kwh + dailyEntries[d].con).toFixed(2))
    monthMap[m].solar_utilized_kwh = parseFloat((monthMap[m].solar_utilized_kwh + dailyEntries[d].selfConsumed).toFixed(2))
    monthMap[m].savings = parseFloat((monthMap[m].savings + dailyEntries[d].savings).toFixed(2))
  })
  const monthlySeries = Object.values(monthMap).sort((a, b) => a.month.localeCompare(b.month))
  const dailyRecords = Object.values(dailyEntries).sort((a, b) => a.date.localeCompare(b.date))

  return {
    hasData: true,
    totalRecords: records.length,
    distinctDays,
    tariff: effectiveTariff,
    emissionFactor: effectiveFactor,

    // Core KPIs
    totalGen: parseFloat(totalGen.toFixed(2)),
    totalCon: parseFloat(totalCon.toFixed(2)),
    totalSelfConsumed: parseFloat(totalSelfConsumed.toFixed(2)),
    totalUtilized: parseFloat(totalSelfConsumed.toFixed(2)),
    totalImp: parseFloat(totalImp.toFixed(2)),
    totalExp: parseFloat(totalExp.toFixed(2)),
    totalExport: parseFloat(totalExp.toFixed(2)),
    totalCharge: parseFloat(totalCharge.toFixed(2)),
    totalDischarge: parseFloat(totalDischarge.toFixed(2)),
    gridDependency,
    selfSufficiency,
    exportPercentage,
    netEnergyBalance,
    totalSavings,
    totalCO2: totalCO2Avoided,
    totalCO2Avoided,
    totalCO2Tonnes: parseFloat((totalCO2Avoided / 1000).toFixed(2)),
    treesEquivalent: co2ToTrees(totalCO2Avoided),
    energyDistribution,
    distribution,
    dailyRecords,
    monthlySeries,

    // Daily Metrics (Latest entered day)
    daily: {
      date: latestDate,
      gen: latestDay ? latestDay.gen : avgDailyGen,
      con: latestDay ? latestDay.con : avgDailyCon,
      selfConsumed: latestDay ? latestDay.selfConsumed : avgDailySelfConsumed,
      savings: latestDay ? latestDay.savings : avgDailySavings,
      co2: latestDay ? latestDay.co2 : avgDailyCO2,
      exp: latestDay ? latestDay.exp : 0,
      imp: latestDay ? latestDay.imp : 0,
    },

    // Averages
    averages: {
      dailyGen: avgDailyGen,
      dailyCon: avgDailyCon,
      dailySelfConsumed: avgDailySelfConsumed,
      dailySavings: avgDailySavings,
      dailyCO2: avgDailyCO2,
    },

    // Weekly (Last 7 days)
    weekly: {
      gen: parseFloat(weeklyGen.toFixed(2)),
      con: parseFloat(weeklyCon.toFixed(2)),
      selfConsumed: parseFloat(weeklySelfConsumed.toFixed(2)),
      savings: weeklySavings,
      co2: weeklyCO2,
    },

    // Monthly (Last 30 days)
    monthly: {
      gen: parseFloat(monthlyGen.toFixed(2)),
      con: parseFloat(monthlyCon.toFixed(2)),
      selfConsumed: parseFloat(monthlySelfConsumed.toFixed(2)),
      savings: monthlySavings,
      co2: monthlyCO2,
      exp: parseFloat(monthlyExp.toFixed(2)),
    },

    // Yearly
    yearly: {
      gen: parseFloat(yearlyGen.toFixed(2)),
      con: parseFloat(yearlyCon.toFixed(2)),
      selfConsumed: parseFloat(yearlySelfConsumed.toFixed(2)),
      savings: yearlySavings,
      co2: yearlyCO2,
    },

    // Distribution breakdown
    distribution,

    // Daily timeseries entries sorted for charts
    timeseries: Object.values(dailyEntries).sort((a, b) => a.date.localeCompare(b.date)),
  }
}

// ─── 7. Formatting Helpers ────────────────────────────────────────────────

export function formatKwh(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `${Number(val).toFixed(2)} kWh`
}

export function formatCO2(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  const num = Number(val)
  return `${num.toFixed(2)} kg`
}

export function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `₹${Number(val).toFixed(2)}`
}

export function formatPercent(val) {
  if (val === null || val === undefined || isNaN(val)) return '—'
  return `${Number(val).toFixed(1)}%`
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
}

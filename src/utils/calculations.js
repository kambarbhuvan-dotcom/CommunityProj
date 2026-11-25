/**
 * calculations.js
 *
 * All solar energy calculations live here — never inline them in components.
 * This makes the math easy to find, test, and change in one place.
 *
 * KEY RULES:
 *   Energy Balance = Generation - Consumption
 *   Estimated Savings = Solar energy utilized × configurable electricity tariff
 *   Estimated CO2 reduction = Solar electricity generated × configurable emission factor
 */

import { ELECTRICITY_RATE, CO2_FACTOR } from './constants'

// ─── Core derivation ──────────────────────────────────────────────────────

/**
 * Calculates solar energy actually used inside the home.
 * @param {number} generatedKwh  - Total solar panel output (kWh)
 * @param {number} exportedKwh   - Energy exported to the grid (kWh), default 0
 * @returns {number} kWh of solar consumed in-home
 */
export function calcSolarUtilized(generatedKwh, exportedKwh = 0) {
  const gen = Number(generatedKwh) || 0
  const exp = Number(exportedKwh) || 0
  return Math.max(0, gen - exp)
}

/**
 * Fallback: estimate solar utilized when export data is not available.
 * @param {number} generatedKwh
 * @param {number} consumptionKwh
 * @returns {number}
 */
export function estimateSolarUtilized(generatedKwh, consumptionKwh) {
  const gen = Number(generatedKwh) || 0
  const con = Number(consumptionKwh) || 0
  return Math.min(gen, con)
}

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
 */
export function co2ToTrees(co2KgAvoided) {
  return Math.round((Number(co2KgAvoided) || 0) / 21)
}

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
}

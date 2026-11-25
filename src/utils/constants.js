/**
 * constants.js
 *
 * Application-wide constants.
 * Edit ELECTRICITY_RATE and CO2_FACTOR here if your local values differ.
 *
 * Sources:
 *   - ELECTRICITY_RATE: average residential tariff in India (₹/kWh)
 *   - CO2_FACTOR: Central Electricity Authority grid emission factor for India
 *     (kg CO₂ equivalent per kWh, FY 2022-23)
 */

// ─── App identity ──────────────────────────────────────────────────────────
export const APP_NAME = 'SolarConnect'
export const APP_VERSION = '1.0.0'

// ─── Energy calculation constants ─────────────────────────────────────────
/** Average residential electricity tariff in India (₹ per kWh) */
export const ELECTRICITY_RATE = 7.50

/** Grid emission factor: kg of CO₂ avoided per kWh of solar used (India average) */
export const CO2_FACTOR = 0.82

// ─── User roles ───────────────────────────────────────────────────────────
export const USER_ROLES = {
  RESIDENT: 'resident',
  ADMIN: 'admin',
}

// ─── Guide categories ─────────────────────────────────────────────────────
export const GUIDE_CATEGORIES = [
  { value: 'basics',       label: 'Solar Basics' },
  { value: 'installation', label: 'Installation' },
  { value: 'maintenance',  label: 'Maintenance' },
  { value: 'savings',      label: 'Savings & Finance' },
]

// ─── Pagination ───────────────────────────────────────────────────────────
export const RECORDS_PER_PAGE = 10
export const ADMIN_RECORDS_PER_PAGE = 20

// ─── Date helpers ─────────────────────────────────────────────────────────
/** Returns today's date as a YYYY-MM-DD string (local time) */
export const todayISO = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Returns the first day of the current month as YYYY-MM-DD */
export const firstOfMonthISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

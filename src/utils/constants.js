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

<<<<<<< HEAD
=======
// ─── Indian Solar & Utility Constants ──────────────────────────────────────
export const INDIAN_CITIES = [
  'Hubballi',
  'Bengaluru',
  'Delhi NCR',
  'Mumbai',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Ahmedabad',
  'Kolkata',
  'Jaipur',
  'Surat',
  'Lucknow',
  'Chandigarh',
  'Kochi',
  'Indore',
  'Coimbatore',
  'Other',
]

export const ELECTRICITY_PROVIDERS = [
  'HESCOM (Hubballi)',
  'BESCOM (Bangalore)',
  'Tata Power (Delhi / Mumbai)',
  'Adani Electricity (Mumbai)',
  'MSEDCL (Maharashtra)',
  'TANGEDCO (Tamil Nadu)',
  'TSSPDCL (Telangana)',
  'UGVCL / DGVCL (Gujarat)',
  'BSES Rajdhani / Yamuna (Delhi)',
  'KSEB (Kerala)',
  'Torrent Power',
  'Other State DISCOM',
]

export const PANEL_TYPES = [
  'Monocrystalline',
  'Polycrystalline',
  'Bifacial Monocrystalline',
  'Thin-Film',
]

export const SYSTEM_TYPES = [
  { value: 'on_grid', label: 'On-Grid / Grid-Tied', desc: 'Net-metered with utility, exports surplus' },
  { value: 'hybrid', label: 'Hybrid (Grid + Battery)', desc: 'Stores in battery, exports excess' },
  { value: 'off_grid', label: 'Off-Grid (Stand-Alone)', desc: 'Independent battery storage only' },
]

export const WEATHER_CONDITIONS = [
  'Sunny / Clear Sky',
  'Partly Cloudy',
  'Overcast / Hazy',
  'Monsoon / Rainy',
]

>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
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

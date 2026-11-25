/**
 * demoData.js
 * Realistic placeholder data for all pages.
 * All energy_logs entries carry is_demo: true so they can be visually labeled.
 */

import { todayISO } from '../utils/constants'

// ─── Profiles ───────────────────────────────────────────────────────────────
export const DEMO_PROFILES = [
  { id: 'demo-1', full_name: 'Priya Sharma',    unit_number: 'A-101', panel_count: 8,  panel_capacity_kw: 3.2, building: 'Block A' },
  { id: 'demo-2', full_name: 'Rahul Verma',     unit_number: 'A-102', panel_count: 10, panel_capacity_kw: 4.0, building: 'Block A' },
  { id: 'demo-3', full_name: 'Meera Nair',      unit_number: 'B-201', panel_count: 12, panel_capacity_kw: 4.8, building: 'Block B' },
  { id: 'demo-4', full_name: 'Arjun Patel',     unit_number: 'B-202', panel_count: 6,  panel_capacity_kw: 2.4, building: 'Block B' },
  { id: 'demo-5', full_name: 'Divya Krishnan',  unit_number: 'C-301', panel_count: 9,  panel_capacity_kw: 3.6, building: 'Block C' },
  { id: 'demo-6', full_name: 'Suresh Reddy',    unit_number: 'C-302', panel_count: 11, panel_capacity_kw: 4.4, building: 'Block C' },
]

/**
 * Generates 90 days of realistic daily energy logs for the primary resident
 * anchored to the current system date so filters like "Today", "Last 7 days",
 * "Last 30 days", and "This month" always have authentic data.
 */
export function generateRealisticDailyLogs(daysCount = 90) {
  const logs = []
  const now = new Date()

  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    // Realistic seasonal & weather wave pattern
    const dayOfWeek = d.getDay()
    const month = d.getMonth()
    // Summer / autumn slightly higher, winter moderate
    const seasonalFactor = month >= 3 && month <= 9 ? 1.15 : 0.95
    // Small pseudo-random daily variance based on date string
    const seed = (d.getDate() * 17 + (d.getMonth() + 1) * 31) % 100
    const weatherFactor = 0.8 + (seed / 100) * 0.45

    const baseGen = 22.5 * seasonalFactor * weatherFactor
    const gen = parseFloat(Math.max(6.5, baseGen).toFixed(2))

    // Consumption fluctuates (weekends slightly higher)
    const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 3.5 : 0
    const baseConsumption = 17.0 + weekendBoost + ((seed % 15) - 7) * 0.5
    const consumption = parseFloat(Math.max(10.0, baseConsumption).toFixed(2))

    // Utilized is bounded by consumption and generation
    const exportCandidate = Math.max(0, gen - consumption * 0.75)
    const gridExport = parseFloat(Math.min(exportCandidate, gen * 0.4).toFixed(2))
    const utilized = parseFloat(Math.max(0, gen - gridExport).toFixed(2))
    const gridImport = parseFloat(Math.max(0, consumption - utilized).toFixed(2))

    logs.push({
      id: `log-${dateStr}`,
      log_date: dateStr,
      solar_generated_kwh: gen,
      solar_utilized_kwh: utilized,
      consumption_kwh: consumption,
      grid_export_kwh: gridExport,
      grid_import_kwh: gridImport,
      is_demo: true,
      notes: i === 0 ? "Today's logged reading" : (seed % 10 === 0 ? 'Clear sky, high generation' : ''),
    })
  }

  return logs
}

// 90 days of resident logs
export const DEMO_DAILY_LOGS = generateRealisticDailyLogs(90)

// Quick aliases
export const DEMO_WEEKLY_LOGS = DEMO_DAILY_LOGS.slice(-7)
export const DEMO_TODAY = DEMO_DAILY_LOGS[DEMO_DAILY_LOGS.length - 1] || {
  solar_generated_kwh: 21.4,
  solar_utilized_kwh: 17.3,
  consumption_kwh: 18.1,
  grid_import_kwh: 0.8,
  grid_export_kwh: 4.1,
  is_demo: true,
}

// ─── Monthly trend helper ──────────────────────────────────────────────────
export function calculateMonthlyTrend(logs = DEMO_DAILY_LOGS, tariff = 7.5) {
  const monthsMap = {}

  logs.forEach((log) => {
    const d = new Date(log.log_date)
    const monthKey = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    if (!monthsMap[monthKey]) {
      monthsMap[monthKey] = {
        month: monthKey,
        sortDate: new Date(d.getFullYear(), d.getMonth(), 1),
        generation: 0,
        consumption: 0,
        utilized: 0,
        savings: 0,
      }
    }
    monthsMap[monthKey].generation += Number(log.solar_generated_kwh) || 0
    monthsMap[monthKey].consumption += Number(log.consumption_kwh) || 0
    monthsMap[monthKey].utilized += Number(log.solar_utilized_kwh) || 0
  })

  return Object.values(monthsMap)
    .sort((a, b) => a.sortDate - b.sortDate)
    .map((m) => ({
      month: m.month,
      generation: parseFloat(m.generation.toFixed(1)),
      consumption: parseFloat(m.consumption.toFixed(1)),
      utilized: parseFloat(m.utilized.toFixed(1)),
      savings: Math.round(m.utilized * tariff),
    }))
}

export const DEMO_MONTHLY_TREND = calculateMonthlyTrend(DEMO_DAILY_LOGS, 7.50)

// ─── Community generation data (by unit & building) ─────────────────────────
export const DEMO_COMMUNITY_UNITS = [
  { unit: 'A-101', resident: 'Priya S.',  building: 'Block A', capacity_kw: 3.2, total_gen_kwh: 342.5, consumption_kwh: 310.2, self_sufficiency: 88 },
  { unit: 'A-102', resident: 'Rahul V.',  building: 'Block A', capacity_kw: 4.0, total_gen_kwh: 418.0, consumption_kwh: 385.0, self_sufficiency: 91 },
  { unit: 'B-201', resident: 'Meera N.',  building: 'Block B', capacity_kw: 4.8, total_gen_kwh: 495.2, consumption_kwh: 420.5, self_sufficiency: 94 },
  { unit: 'B-202', resident: 'Arjun P.',  building: 'Block B', capacity_kw: 2.4, total_gen_kwh: 268.4, consumption_kwh: 290.0, self_sufficiency: 78 },
  { unit: 'C-301', resident: 'Divya K.',  building: 'Block C', capacity_kw: 3.6, total_gen_kwh: 384.6, consumption_kwh: 340.2, self_sufficiency: 89 },
  { unit: 'C-302', resident: 'Suresh R.', building: 'Block C', capacity_kw: 4.4, total_gen_kwh: 462.1, consumption_kwh: 395.8, self_sufficiency: 92 },
]

export const DEMO_COMMUNITY_STATS = {
  totalGeneratedKwh: 24205,
  totalUtilizedKwh: 19364,
  totalConsumptionKwh: 20888,
  totalCO2Kg: 15888.1,
  totalSavedRs: 145230,
  activeResidents: 6,
  monthGeneratedKwh: 2370.8,
  monthCO2Kg: 1944.0,
  monthSavedRs: 15840,
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export const DEMO_LEADERBOARD = [
  { rank: 1, unit: 'B-201', name: 'Meera N.', gen: 495.2, co2: 406.1 },
  { rank: 2, unit: 'C-302', name: 'Suresh R.', gen: 462.1, co2: 378.9 },
  { rank: 3, unit: 'A-102', name: 'Rahul V.', gen: 418.0, co2: 342.8 },
  { rank: 4, unit: 'C-301', name: 'Divya K.', gen: 384.6, co2: 315.4 },
  { rank: 5, unit: 'A-101', name: 'Priya S.', gen: 342.5, co2: 280.9 },
  { rank: 6, unit: 'B-202', name: 'Arjun P.', gen: 268.4, co2: 220.1 },
]

// ─── Achievements ────────────────────────────────────────────────────────────
export const DEMO_ACHIEVEMENTS = [
  { id: 'a1', title: 'First kWh Generated',    description: 'The community logged its very first solar kilowatt-hour.', icon: 'Sun',    achieved_at: '2026-06-01', threshold_kwh: 1 },
  { id: 'a2', title: '100 kWh Milestone',      description: 'Community solar generation crossed 100 kWh total.',        icon: 'Trophy', achieved_at: '2026-06-14', threshold_kwh: 100 },
  { id: 'a3', title: 'First Month Complete',   description: 'All residents logged energy for a full calendar month.',   icon: 'Star',   achieved_at: '2026-06-30', threshold_kwh: null },
  { id: 'a4', title: '1 MWh Club',             description: 'Community crossed 1,000 kWh of total solar generation.',   icon: 'Zap',    achieved_at: '2026-08-05', threshold_kwh: 1000 },
  { id: 'a5', title: '50 Trees Equivalent',    description: 'CO₂ avoided is equivalent to planting 50 trees.',          icon: 'Leaf',   achieved_at: '2026-09-20', threshold_kwh: null },
  { id: 'a6', title: '10 MWh Powerhouse',      description: 'Community solar crossed 10 MWh — a major milestone!',      icon: 'Award',  achieved_at: '2026-11-01', threshold_kwh: 10000 },
]

// ─── Announcements ───────────────────────────────────────────────────────────
export const DEMO_ANNOUNCEMENTS = [
  {
    id: 'ann1', title: 'Solar Project Launch!', is_pinned: true, published_at: '2026-06-01',
    body: 'We are thrilled to announce the official launch of SolarConnect for our community! All residents can now log their daily solar generation and consumption. Together we can track our collective impact and move towards a greener future.',
  },
  {
    id: 'ann2', title: 'Panel Cleaning Drive', is_pinned: true, published_at: '2026-11-05',
    body: 'Join us for a community panel cleaning session this Saturday at 7 AM. Regular cleaning improves panel efficiency by up to 20%. Cleaning supplies will be provided. Meet at the common terrace.',
  },
  {
    id: 'ann3', title: 'Record Generation Month! 🎉', is_pinned: false, published_at: '2026-11-01',
    body: 'Last month was our best month yet — we collectively generated 2,560 kWh of solar energy, saved ₹13,056 in electricity costs, and avoided over 2 tonnes of CO₂ emissions. Fantastic work, everyone!',
  },
]

// ─── Guides ──────────────────────────────────────────────────────────────────
export const DEMO_GUIDES = [
  {
    id: 'g1', slug: 'solar-energy-basics', category: 'basics', is_published: true,
    title: 'Understanding Solar Energy Basics',
    summary: 'Learn how solar panels convert sunlight into electricity and why solar is the fastest-growing energy source.',
    body: `## What is Solar Energy?\n\nSolar energy is light and heat that comes from the Sun. Photovoltaic (PV) panels capture this energy and convert it directly into electricity.\n\n## The Photovoltaic Effect\n\nWhen sunlight hits a solar cell, photons knock electrons loose from atoms in silicon. These free electrons flow through a circuit, generating direct current (DC) electricity.\n\n## Why Solar?\n\n- Reduces electricity bills\n- Zero carbon emissions\n- Low maintenance`,
  },
  {
    id: 'g2', slug: 'reading-your-dashboard', category: 'basics', is_published: true,
    title: 'How to Read Your Solar Dashboard',
    summary: 'A simple guide to understanding every number on your SolarConnect dashboard.',
    body: `## Dashboard Metrics Explained\n\n- **Solar Generated**: Total energy produced by panels.\n- **Solar Utilized**: Energy consumed directly in your home. This gives you bill savings.\n- **Consumption**: Total electricity used by appliances.\n- **Self-Sufficiency**: (Utilized ÷ Consumption) × 100`,
  },
  {
    id: 'g3', slug: 'solar-panel-installation', category: 'installation', is_published: true,
    title: 'Solar Panel Installation Guide',
    summary: 'Step-by-step overview of what to expect during a residential solar panel installation.',
    body: `## Installation Steps\n\n1. Roof evaluation and tilt angle calculation (15–30° south-facing).\n2. Mounting aluminum rails.\n3. Installing solar panels and string wiring.\n4. Inverter hookup and bidirectional net meter setup.`,
  },
]

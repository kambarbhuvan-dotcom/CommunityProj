/**
<<<<<<< HEAD
 * DashboardPage.jsx — Functional SolarConnect Dashboard
 *
 * Implements:
 * - 5 Required Stat Cards:
 *   1. Total Solar Energy Generated (kWh)
 *   2. Total Electricity Consumed (kWh)
 *   3. Solar Energy Utilized (kWh)
 *   4. Estimated Electricity Bill Savings (INR)
 *   5. Estimated CO2 Emission Reduction (kg)
 *   + Energy Balance (Generation - Consumption)
 *
 * - 4 Required Charts:
 *   1. Daily solar energy generation chart
 *   2. Monthly solar energy generation chart
 *   3. Solar generation vs electricity consumption comparison
 *   4. Community-wise solar generation chart
 *
 * - Filter Options:
 *   - Today
 *   - Last 7 days
 *   - Last 30 days
 *   - This month
 *   - Custom date range
 *
 * - Configurable Rates (Tariff & CO2 emission factor) with localStorage persistence
 * - Dynamic aggregation from available records (never hardcoded)
 * - Clear empty states when no records match
 * - Transparent explanation that savings & environmental impacts are estimates
 */

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Zap, Leaf, DollarSign, Scale, Calendar, SlidersHorizontal,
  Info, TrendingUp, RefreshCw, PlusCircle, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/ui/StatCard'
import DemoBanner from '../../components/ui/DemoBanner'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Toast from '../../components/ui/Toast'
import { SkeletonStatCard, SkeletonChart } from '../../components/ui/Skeleton'
import SolarHouse3D from '../../components/SolarHouse3D'

// Charts
import DailySolarChart from '../../components/charts/DailySolarChart'
import MonthlySolarChart from '../../components/charts/MonthlySolarChart'
import GenVsConsumptionChart from '../../components/charts/GenVsConsumptionChart'
import CommunitySolarChart from '../../components/charts/CommunitySolarChart'

// Data & Utils
import { useAuth } from '../../context/AuthContext'
import {
  DEMO_COMMUNITY_UNITS, calculateMonthlyTrend,
} from '../../data/demoData'
import { getStoredRecords, getAllRecords } from '../../services/energyStorageService'
import {
  calcCostSaved, calcCO2Avoided, calcEnergyBalance, calcSelfSufficiency,
  formatKwh, formatCurrency, formatCO2, formatPercent,
} from '../../utils/calculations'
import { formatDate, formatRelativeDate } from '../../utils/formatters'
import { ELECTRICITY_RATE, CO2_FACTOR, todayISO } from '../../utils/constants'

export default function DashboardPage() {
  const { profile } = useAuth()

  // ─── Live Records from Storage Service ────────────────────────────────────
  const [allRecords, setAllRecords] = useState(() => getStoredRecords())
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function refresh() {
      try {
        setLoading(true)
        const records = await getAllRecords()
        if (isMounted) setAllRecords(records)
      } catch {
        if (isMounted) setAllRecords(getStoredRecords())
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    refresh()
    window.addEventListener('storage', refresh)
    window.addEventListener('focus', refresh)
    return () => {
      isMounted = false
      window.removeEventListener('storage', refresh)
      window.removeEventListener('focus', refresh)
    }
  }, [])

  // ─── Configurable Tariff & Emission Factor (with localStorage persistence) ──
  const [tariff, setTariff] = useState(() => {
    const saved = localStorage.getItem('solarconnect_tariff')
    return saved !== null ? parseFloat(saved) : ELECTRICITY_RATE
  })

  const [emissionFactor, setEmissionFactor] = useState(() => {
    const saved = localStorage.getItem('solarconnect_emission_factor')
    return saved !== null ? parseFloat(saved) : CO2_FACTOR
  })

  const [configModalOpen, setConfigModalOpen] = useState(false)
  const [tempTariff, setTempTariff] = useState(tariff)
  const [tempFactor, setTempFactor] = useState(emissionFactor)

  const handleSaveConfig = () => {
    const t = parseFloat(tempTariff) > 0 ? parseFloat(tempTariff) : ELECTRICITY_RATE
    const ef = parseFloat(tempFactor) > 0 ? parseFloat(tempFactor) : CO2_FACTOR
    setTariff(t)
    setEmissionFactor(ef)
    localStorage.setItem('solarconnect_tariff', t.toString())
    localStorage.setItem('solarconnect_emission_factor', ef.toString())
    setConfigModalOpen(false)
    setToast({
      message: `Calculation parameters updated: ₹${t.toFixed(2)}/kWh tariff & ${ef.toFixed(2)} kg CO₂/kWh factor.`,
      type: 'success',
      title: 'Rates Updated',
    })
  }

  // ─── Filter State ──────────────────────────────────────────────────────────
  // 'today' | '7days' | '30days' | 'thisMonth' | 'custom'
  const [activeFilter, setActiveFilter] = useState('7days')

  const todayStr = useMemo(() => todayISO(), [])
  const [customStartDate, setCustomStartDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 14)
    return d.toISOString().split('T')[0]
  })
  const [customEndDate, setCustomEndDate] = useState(todayStr)

  // ─── Filter Records Dynamically ────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    const now = new Date()
    const today = todayStr

    return allRecords.filter((record) => {
      const recordDate = record.log_date
      if (!recordDate) return false

      if (activeFilter === 'today') {
        return recordDate === today
      }

      if (activeFilter === '7days') {
        const threshold = new Date(now)
        threshold.setDate(threshold.getDate() - 6)
        const threshStr = threshold.toISOString().split('T')[0]
        return recordDate >= threshStr && recordDate <= today
      }

      if (activeFilter === '30days') {
        const threshold = new Date(now)
        threshold.setDate(threshold.getDate() - 29)
        const threshStr = threshold.toISOString().split('T')[0]
        return recordDate >= threshStr && recordDate <= today
      }

      if (activeFilter === 'thisMonth') {
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return recordDate.startsWith(currentMonthPrefix)
      }

      if (activeFilter === 'custom') {
        if (customStartDate && customEndDate) {
          return recordDate >= customStartDate && recordDate <= customEndDate
        }
        return true
      }

      return true
    }).sort((a, b) => new Date(a.log_date) - new Date(b.log_date))
  }, [allRecords, activeFilter, customStartDate, customEndDate, todayStr])

  // ─── Dynamic Totals Derived from Available Records ────────────────────────
  const totals = useMemo(() => {
    let totalGen = 0
    let totalConsumed = 0
    let totalUtilized = 0

    filteredRecords.forEach((r) => {
      totalGen += Number(r.solar_generated_kwh) || 0
      totalConsumed += Number(r.consumption_kwh) || 0
      totalUtilized += Number(r.solar_utilized_kwh) || 0
    })

    const balance = calcEnergyBalance(totalGen, totalConsumed)
    const savings = calcCostSaved(totalUtilized, tariff)
    const co2 = calcCO2Avoided(totalGen, emissionFactor)
    const selfSufficiency = calcSelfSufficiency(totalUtilized, totalConsumed)

    return {
      totalGen: parseFloat(totalGen.toFixed(2)),
      totalConsumed: parseFloat(totalConsumed.toFixed(2)),
      totalUtilized: parseFloat(totalUtilized.toFixed(2)),
      balance: parseFloat(balance.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      co2: parseFloat(co2.toFixed(2)),
      selfSufficiency: parseFloat(selfSufficiency.toFixed(1)),
      count: filteredRecords.length,
    }
  }, [filteredRecords, tariff, emissionFactor])

  // ─── Monthly Trend Data for Monthly Chart ─────────────────────────────────
  const monthlyTrendData = useMemo(() => {
    return calculateMonthlyTrend(allRecords, tariff)
  }, [allRecords, tariff])

  // ─── Recent Records (Latest 5 in reverse chronological order) ─────────────
  const recentRecords = useMemo(() => {
    return [...allRecords]
      .sort((a, b) => new Date(b.log_date) - new Date(a.log_date))
      .slice(0, 5)
  }, [])

  return (
    <AppLayout>
      <PageWrapper
        title={`Welcome, ${profile?.full_name?.split(' ')[0] || 'Resident'}! ☀️`}
        subtitle="Community solar energy awareness, generation tracking, and environmental impact."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTempTariff(tariff)
                setTempFactor(emissionFactor)
                setConfigModalOpen(true)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#DCEBFA] bg-white text-xs font-semibold text-[#153B65] hover:bg-[#EAF6FF] hover:text-[#2563EB] transition-colors shadow-xs"
              title="Configure electricity tariff and CO2 factor"
            >
              <SlidersHorizontal size={14} className="text-[#2563EB]" />
              <span>Rates: ₹{tariff}/kWh</span>
            </button>
            <Link to="/log">
              <Button variant="primary" size="sm">
                <PlusCircle size={14} /> Log Energy
              </Button>
            </Link>
          </div>
        }
      >
        {/* Immersive 3D solar visualization — visual layer only; live totals remain data-driven. */}
        <section className="sc-3d-stage" aria-label="Solar energy overview">
          <div className="sc-stage-copy">
            <div className="sc-stage-kicker">SolarConnect • Community energy intelligence</div>
            <h2>Turn sunlight into a smarter, greener community.</h2>
            <p>Explore your community solar performance through a spatial, glass-inspired energy dashboard. The figures below are calculated from the selected records.</p>
            <div className="sc-stage-pills">
              <span>✦ Clean energy</span><span>◉ Live dashboard data</span><span>↗ Impact tracking</span>
            </div>
          </div>
          <div className="sc-solar-art">
            <SolarHouse3D />
            <div className="sc-float-metric"><small>Energy generated</small><strong>{Number(totals.totalGen).toLocaleString('en-IN')} kWh</strong><small>{totals.count} records in selected period</small></div>
          </div>
        </section>
        {/* Toast Feedback */}
=======
 * DashboardPage.jsx — Personalized Solar Energy Dashboard
 *
 * ZERO DEMO DATA:
 * - When no records exist, displays a welcoming onboarding flow:
 *   * 'Welcome to SolarConnect!'
 *   * Step 1: Set Up Your Solar System (/setup)
 *   * Step 2: Log Your First Day's Energy (/log)
 *   * Step 3: View Automated Savings & Environmental Analytics
 *
 * Populated Dashboard:
 * - 8 KPI Cards:
 *   1. Total Solar Generation (cumulative kWh)
 *   2. Total Household Consumption (cumulative kWh)
 *   3. Solar Self-Consumption (cumulative kWh utilized on-site)
 *   4. Grid Dependency % (Grid Imported / Total Consumption * 100)
 *   5. Estimated Electricity Savings (INR, clearly labeled as estimated)
 *   6. Estimated CO2 Avoided (kg or tonnes)
 *   7. Energy Exported to Grid (kWh)
 *   8. Solar Self-Sufficiency % (Solar Utilized / Total Consumption * 100)
 *
 * - 6 Interactive Charts:
 *   1. Daily Solar Generation Chart
 *   2. Monthly Generation vs. Consumption (grouped bar)
 *   3. Grid Import vs. Solar Utilization
 *   4. Monthly Savings Trend (bar in INR)
 *   5. CO2 Reduction Impact (area/line)
 *   6. Energy Distribution Breakdown (donut/pie: Self-Consumed vs Exported vs Grid Imported)
 *
 * - Date Range Filters:
 *   * Last 7 Days, Last 30 Days, Last 3 Months, Last 6 Months, This Year, Custom Date Range
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Zap, Leaf, DollarSign, Scale, Calendar, SlidersHorizontal,
  ArrowRight, CheckCircle2, Sparkles, TrendingUp, RefreshCw,
  PlusCircle, BatteryCharging, ArrowUpRight, ArrowDownRight,
  ShieldCheck, HelpCircle, Layers, PieChart as PieIcon, LineChart as LineIcon
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts'

import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import { SkeletonStatCard, SkeletonChart } from '../../components/ui/Skeleton'
import Toast from '../../components/ui/Toast'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { getEnergyLogs, getSolarSetup, getUserSettings } from '../../services/solarDataService'
import {
  calculateAggregatedAnalytics, filterRecordsByDateRange,
  calcCostSaved, calcCO2Avoided, formatKwh, formatCurrency, formatPercent
} from '../../utils/calculations'
import { formatDate } from '../../utils/formatters'
import { todayISO } from '../../utils/constants'

const DISTRIBUTION_COLORS = ['#22C55E', '#0EA5E9', '#94A3B8']

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [solarSetup, setSolarSetup] = useState(null)
  const [userSettings, setUserSettings] = useState(null)

  // Filters
  const [dateRange, setDateRange] = useState('30days') // '7days' | '30days' | '3months' | '6months' | 'thisYear' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  // Load user data
  async function loadData() {
    setLoading(true)
    try {
      const [userLogs, setup, settings] = await Promise.all([
        getEnergyLogs(user?.id),
        getSolarSetup(user?.id),
        getUserSettings(user?.id),
      ])
      setLogs(userLogs)
      setSolarSetup(setup)
      setUserSettings(settings)
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  // Filter records
  const filteredRecords = useMemo(() => {
    return filterRecordsByDateRange(logs, dateRange, customStart, customEnd)
  }, [logs, dateRange, customStart, customEnd])

  // Calculated Analytics
  const analytics = useMemo(() => {
    const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
    const factor = Number(userSettings?.grid_emission_factor ?? 0.82)
    return calculateAggregatedAnalytics(filteredRecords, tariff, factor)
  }, [filteredRecords, userSettings])

  if (loading) {
    return (
      <AppLayout>
        <PageWrapper title="Dashboard" subtitle="Loading live solar metrics...">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart />
            <SkeletonChart />
          </div>
        </PageWrapper>
      </AppLayout>
    )
  }

  // ─── ONBOARDING / EMPTY STATE WHEN ZERO RECORDS EXIST ───────────────────────
  if (logs.length === 0) {
    const hasSetup = Boolean(solarSetup?.system_capacity_kw)

    return (
      <AppLayout>
        <PageWrapper
          title="Dashboard"
          subtitle="Your personalized solar energy analytics portal."
        >
          <div className="max-w-4xl mx-auto space-y-8 py-6">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#153B65] via-[#1D4ED8] to-[#0EA5E9] p-8 md:p-12 text-white shadow-lg">
              <div className="relative z-10 max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide">
                  <Sparkles size={14} className="text-[#87CEEB]" />
                  <span>Welcome to SolarConnect</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  Start Managing Your Real Rooftop Solar Energy
                </h1>
                <p className="text-white/85 text-sm md:text-base leading-relaxed">
                  SolarConnect computes your automated solar analytics, electricity bill savings, and carbon reduction directly from your actual equipment specs and meter readings.
                </p>
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {!hasSetup ? (
                    <Link
                      to="/setup"
                      className="px-6 py-3 rounded-xl bg-white text-[#153B65] font-bold text-sm shadow-md hover:bg-[#EAF6FF] transition-all flex items-center gap-2"
                    >
                      <span>Set Up Your Solar System</span>
                      <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <Link
                      to="/log"
                      className="px-6 py-3 rounded-xl bg-white text-[#153B65] font-bold text-sm shadow-md hover:bg-[#EAF6FF] transition-all flex items-center gap-2"
                    >
                      <span>Log Your First Day's Energy</span>
                      <ArrowRight size={16} />
                    </Link>
                  )}
                  <Link
                    to="/guides"
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm transition-all border border-white/20"
                  >
                    Learn How It Works
                  </Link>
                </div>
              </div>

              {/* Decorative Background Orb */}
              <div className="absolute -right-12 -bottom-16 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            </div>

            {/* 3 Step Getting Started Progress */}
            <Card className="border border-[#DCEBFA] shadow-sm p-6 md:p-8">
              <h2 className="text-base font-bold text-[#153B65] mb-6 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-[#2563EB]" />
                Your 3-Step Setup Roadmap
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Step 1 */}
                <div className={`p-5 rounded-2xl border transition-all ${
                  hasSetup ? 'border-[#22C55E]/40 bg-[#22C55E]/5' : 'border-[#2563EB]/40 bg-[#EAF6FF]/50'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">Step 1</span>
                    {hasSetup && (
                      <span className="text-xs font-bold text-[#22C55E] flex items-center gap-1">
                        <CheckCircle2 size={14} /> Done
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-[#153B65] text-sm mb-1.5">Configure System Specs</h3>
                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                    Enter your rooftop capacity (kW), panel type, battery specifications, and local DISCOM tariff.
                  </p>
                  <Link
                    to="/setup"
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    {hasSetup ? 'Edit Solar Setup' : 'Complete Setup'}
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl border border-[#DCEBFA] bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Step 2</span>
                  </div>
                  <h3 className="font-bold text-[#153B65] text-sm mb-1.5">Log Daily Energy Usage</h3>
                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                    Input your daily meter generation (kWh), total power consumption, and net grid export readings.
                  </p>
                  <Link
                    to="/log"
                    className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    Go to Log Energy
                    <ArrowRight size={13} />
                  </Link>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl border border-[#DCEBFA] bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">Step 3</span>
                  </div>
                  <h3 className="font-bold text-[#153B65] text-sm mb-1.5">Automated Intelligence</h3>
                  <p className="text-xs text-[#64748B] mb-4 leading-relaxed">
                    SolarConnect automatically updates your KPI cards, interactive charts, savings, and CO₂ offset.
                  </p>
                  <span className="text-xs font-semibold text-[#94A3B8]">
                    Unlocks after 1st log
                  </span>
                </div>
              </div>
            </Card>

            {/* Zero Fake Data Assurance */}
            <div className="p-4 rounded-2xl bg-[#F4FAFF] border border-[#DCEBFA] text-xs text-[#64748B] flex items-start gap-3">
              <ShieldCheck size={18} className="text-[#0EA5E9] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#153B65] block mb-0.5">Real Data Guarantee</strong>
                SolarConnect does not present synthetic or placeholder generation values. Your charts and metrics will populate strictly from your logged meter records.
              </div>
            </div>
          </div>
        </PageWrapper>
      </AppLayout>
    )
  }

  // ─── POPULATED DASHBOARD ────────────────────────────────────────────────────
  return (
    <AppLayout>
      <PageWrapper
        title="Personalized Dashboard"
        subtitle="Live automated analytics derived from your actual solar meter logs."
      >
        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-3.5 rounded-2xl border border-[#DCEBFA] shadow-xs">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#2563EB]" />
            <span className="text-xs font-bold text-[#153B65]">Time Range:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { key: '7days', label: 'Last 7 Days' },
              { key: '30days', label: 'Last 30 Days' },
              { key: '3months', label: 'Last 3 Months' },
              { key: '6months', label: 'Last 6 Months' },
              { key: 'thisYear', label: 'This Year' },
              { key: 'all', label: 'All Time' },
              { key: 'custom', label: 'Custom' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setDateRange(f.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  dateRange === f.key
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#153B65] hover:bg-[#EAF6FF]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="w-full flex items-center gap-2 pt-2 border-t border-[#DCEBFA] text-xs">
              <span className="text-[#64748B]">From:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#DCEBFA] text-xs"
              />
              <span className="text-[#64748B]">To:</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1 rounded-lg border border-[#DCEBFA] text-xs"
              />
            </div>
          )}
        </div>

        {/* 8 KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* 1. Total Solar Generation */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Total Generation</span>
              <Sun size={16} className="text-[#0EA5E9]" />
            </div>
            <div className="text-2xl font-extrabold text-[#153B65] tracking-tight">
              {analytics.totalGen.toFixed(1)} <span className="text-xs font-semibold text-[#64748B]">kWh</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">From rooftop inverter</p>
          </Card>

          {/* 2. Total Household Consumption */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Total Consumed</span>
              <Zap size={16} className="text-[#2563EB]" />
            </div>
            <div className="text-2xl font-extrabold text-[#153B65] tracking-tight">
              {analytics.totalCon.toFixed(1)} <span className="text-xs font-semibold text-[#64748B]">kWh</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Home electricity usage</p>
          </Card>

          {/* 3. Solar Self-Consumption */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Self-Consumption</span>
              <BatteryCharging size={16} className="text-[#22C55E]" />
            </div>
            <div className="text-2xl font-extrabold text-[#22C55E] tracking-tight">
              {analytics.totalUtilized.toFixed(1)} <span className="text-xs font-semibold text-[#153B65]">kWh</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Directly used on-site</p>
          </Card>

          {/* 4. Grid Dependency % */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Grid Dependency</span>
              <Scale size={16} className="text-[#64748B]" />
            </div>
            <div className="text-2xl font-extrabold text-[#153B65] tracking-tight">
              {analytics.gridDependency.toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Import / Consumption</p>
          </Card>

          {/* 5. Estimated Electricity Savings */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Estimated Savings</span>
              <DollarSign size={16} className="text-[#22C55E]" />
            </div>
            <div className="text-2xl font-extrabold text-[#22C55E] tracking-tight">
              ₹{analytics.totalSavings.toFixed(0)}
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Tariff: ₹{Number(userSettings?.electricity_tariff_inr ?? 7.50).toFixed(2)}/kWh</p>
          </Card>

          {/* 6. Estimated CO2 Avoided */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>CO₂ Avoided</span>
              <Leaf size={16} className="text-[#0EA5E9]" />
            </div>
            <div className="text-2xl font-extrabold text-[#153B65] tracking-tight">
              {analytics.totalCO2.toFixed(1)} <span className="text-xs font-semibold text-[#64748B]">kg</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">CEA grid factor: 0.82</p>
          </Card>

          {/* 7. Energy Exported to Grid */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Exported to Grid</span>
              <ArrowUpRight size={16} className="text-[#0EA5E9]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0EA5E9] tracking-tight">
              {analytics.totalExport.toFixed(1)} <span className="text-xs font-semibold text-[#64748B]">kWh</span>
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">{analytics.exportPercentage.toFixed(1)}% of generation</p>
          </Card>

          {/* 8. Solar Self-Sufficiency % */}
          <Card className="border border-[#DCEBFA] p-4 bg-white shadow-xs">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-medium mb-1.5">
              <span>Self-Sufficiency</span>
              <TrendingUp size={16} className="text-[#2563EB]" />
            </div>
            <div className="text-2xl font-extrabold text-[#2563EB] tracking-tight">
              {analytics.selfSufficiency.toFixed(1)}%
            </div>
            <p className="text-[11px] text-[#64748B] mt-1">Solar / Consumption</p>
          </Card>
        </div>

        {/* 6 INTERACTIVE CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Chart 1: Daily Solar Generation */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">1. Daily Solar Generation</h3>
                <p className="text-[11px] text-[#64748B]">Daily inverter power output in kWh</p>
              </div>
              <span className="text-xs font-bold text-[#0EA5E9] bg-[#EAF6FF] px-2.5 py-1 rounded-lg">
                {analytics.dailyRecords.length} Days
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="log_date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`${Number(val).toFixed(2)} kWh`, 'Generation']}
                  />
                  <Bar dataKey="solar_generated_kwh" name="Generation" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Monthly Generation vs. Consumption */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">2. Generation vs Consumption</h3>
                <p className="text-[11px] text-[#64748B]">Monthly solar generated vs household power consumed</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`${Number(val).toFixed(1)} kWh`]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="solar_generated_kwh" name="Solar Gen" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="consumption_kwh" name="Consumption" fill="#2563EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 3: Grid Import vs Solar Utilization */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">3. Grid Import vs Solar Utilization</h3>
                <p className="text-[11px] text-[#64748B]">On-site solar used vs utility grid energy drawn</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.dailyRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="log_date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`${Number(val).toFixed(2)} kWh`]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="solar_utilized_kwh" name="Solar Utilized" fill="#22C55E" stackId="a" />
                  <Bar dataKey="grid_import_kwh" name="Grid Imported" fill="#94A3B8" stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 4: Monthly Savings Trend */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">4. Monthly Savings Trend (INR)</h3>
                <p className="text-[11px] text-[#64748B]">Estimated electricity bill savings by month</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlySeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" ₹" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`₹${Number(val).toFixed(0)}`, 'Saved']}
                  />
                  <Bar dataKey="savings_inr" name="Estimated Savings (₹)" fill="#22C55E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 5: CO2 Reduction Impact */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">5. CO₂ Reduction Impact</h3>
                <p className="text-[11px] text-[#64748B]">Emissions avoided from displaced coal grid power (kg CO₂)</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.dailyRecords}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="log_date" tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" kg" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`${(Number(val) * 0.82).toFixed(2)} kg CO₂`, 'Avoided']}
                  />
                  <Area
                    type="monotone"
                    dataKey="solar_utilized_kwh"
                    name="Solar Offset"
                    stroke="#0EA5E9"
                    fill="#EAF6FF"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 6: Energy Distribution Breakdown */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">6. Energy Distribution Breakdown</h3>
                <p className="text-[11px] text-[#64748B]">Proportion of self-consumed, exported, and imported energy</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.energyDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {analytics.energyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${Number(val).toFixed(1)} kWh`, name]}
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>

        {/* Calculation Methodology & Disclaimer Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-card p-6 border border-[#DCEBFA]">
          <div className="flex items-start gap-3">
            <ShieldCheck size={20} className="text-[#2563EB] shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs text-[#64748B]">
              <h4 className="font-bold text-sm text-[#153B65]">Calculation Methodology & Standards</h4>
              <p>
                Metrics are automatically calculated on the client side from your recorded meter readings. Savings represent avoided utility purchases at your configured tariff. Emissions avoided use the CEA baseline factor (0.82 kg CO₂/kWh).
              </p>
            </div>
          </div>
        </div>

>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            title={toast.title}
            onClose={() => setToast(null)}
          />
        )}
<<<<<<< HEAD

        {/* Demo data banner */}
        <DemoBanner
          className="mb-6"
          message="Displaying verified demonstration records for initial portal testing. Statistics update dynamically as filter periods change."
        />

        {/* ── Filter Bar ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-6 border border-[#DCEBFA]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#64748B] uppercase tracking-wide mr-1 flex items-center gap-1">
                <Calendar size={13} className="text-[#0EA5E9]" /> Filter:
              </span>
              {[
                { id: 'today',     label: 'Today' },
                { id: '7days',     label: 'Last 7 days' },
                { id: '30days',    label: 'Last 30 days' },
                { id: 'thisMonth', label: 'This month' },
                { id: 'custom',    label: 'Custom range' },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeFilter === filter.id
                      ? 'bg-[#2563EB] text-white shadow-xs ring-2 ring-[#87CEEB]'
                      : 'bg-[#F4FAFF] text-[#153B65] hover:bg-[#EAF6FF] hover:text-[#2563EB] border border-[#DCEBFA]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Custom Range Inputs */}
            {activeFilter === 'custom' && (
              <div className="flex items-center gap-2 text-xs bg-[#F4FAFF] p-2 rounded-xl border border-[#DCEBFA]">
                <span className="text-[#64748B] font-medium">From:</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[#DCEBFA] text-xs bg-white text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <span className="text-[#64748B] font-medium">To:</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 rounded-lg border border-[#DCEBFA] text-xs bg-white text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>
            )}

            {/* Filter Summary */}
            <div className="text-xs text-[#64748B] flex items-center gap-2">
              <span>Matching records: <strong className="text-[#153B65] font-bold">{totals.count}</strong></span>
              {totals.count > 0 && (
                <span className="bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] px-2.5 py-0.5 rounded-full font-bold">
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── 5 Required Statistic Cards ──────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {/* Card 1: Total Solar Energy Generated */}
            <StatCard
              title="Total Solar Generated"
              value={totals.count > 0 ? totals.totalGen.toLocaleString() : '0.00'}
              unit="kWh"
              icon={Sun}
              color="sky"
              subtitle="Gross panel production"
              isDemo
            />

            {/* Card 2: Total Electricity Consumed */}
            <StatCard
              title="Total Consumed"
              value={totals.count > 0 ? totals.totalConsumed.toLocaleString() : '0.00'}
              unit="kWh"
              icon={Zap}
              color="blue"
              subtitle="Household load"
              isDemo
            />

            {/* Card 3: Solar Energy Utilized */}
            <StatCard
              title="Solar Utilized"
              value={totals.count > 0 ? totals.totalUtilized.toLocaleString() : '0.00'}
              unit="kWh"
              icon={Scale}
              color="sky"
              subtitle="Direct in-home solar used"
              isDemo
            />

            {/* Card 4: Estimated Electricity Bill Savings */}
            <StatCard
              title="Est. Bill Savings"
              value={totals.count > 0 ? `₹${Math.round(totals.savings).toLocaleString()}` : '₹0'}
              icon={DollarSign}
              color="green"
              subtitle={`At ₹${tariff.toFixed(2)} / kWh tariff`}
              isDemo
            />

            {/* Card 5: Estimated CO2 Emission Reduction */}
            <StatCard
              title="Est. CO₂ Reduction"
              value={totals.count > 0 ? totals.co2.toLocaleString() : '0.00'}
              unit="kg"
              icon={Leaf}
              color="sky"
              subtitle={`At ${emissionFactor.toFixed(2)} kg CO₂/kWh`}
              isDemo
            />
          </div>
        )}

        {/* ── Energy Balance & Self-Sufficiency Indicator Bar ────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-card border border-[#DCEBFA] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] font-semibold">Energy Balance (Gen − Con)</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-xl font-black ${totals.balance >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
                  {totals.balance >= 0 ? '+' : ''}{totals.balance.toLocaleString()} kWh
                </span>
                {totals.balance >= 0 ? (
                  <span className="inline-flex items-center text-xs font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full">
                    <ArrowUpRight size={13} /> Clean Surplus
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    <ArrowDownRight size={13} /> Grid Deficit
                  </span>
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
              <Scale size={20} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-[#DCEBFA] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] font-semibold">Self-Sufficiency Ratio</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-black text-[#2563EB]">
                  {totals.count > 0 ? `${totals.selfSufficiency}%` : '0%'}
                </span>
                <span className="text-xs text-[#64748B]">of home consumption</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#0EA5E9]">
              <Zap size={20} />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-card border border-[#DCEBFA] flex items-center justify-between">
            <div>
              <p className="text-xs text-[#64748B] font-semibold">Equivalent Trees Planted</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xl font-black text-[#22C55E]">
                  {Math.round(totals.co2 / 21)} trees
                </span>
                <span className="text-xs text-[#64748B]">(21 kg CO₂ / yr)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center text-[#22C55E]">
              <Leaf size={20} />
            </div>
          </div>
        </div>

        {/* ── 4 Required Charts ───────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            <SkeletonChart title="Loading Daily Solar Generation..." />
            <SkeletonChart title="Loading Monthly Solar Generation..." />
            <SkeletonChart title="Loading Solar vs Consumption Comparison..." />
            <SkeletonChart title="Loading Community-Wise Generation..." />
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card className="mb-6">
            <EmptyState
              icon={Calendar}
              title="No records found for this filter"
              description="There are no energy entries matching your selected date range. Try choosing 'Last 7 days' or 'Last 30 days'."
              action={{
                label: 'Reset to Last 7 Days',
                onClick: () => setActiveFilter('7days'),
              }}
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
            {/* Chart 1: Daily Solar Energy Generation Chart */}
            <Card className="hover:shadow-card-hover transition-shadow duration-200">
              <DailySolarChart
                data={filteredRecords}
                title="1. Daily Solar Energy Generation"
              />
            </Card>

            {/* Chart 2: Monthly Solar Energy Generation Chart */}
            <Card className="hover:shadow-card-hover transition-shadow duration-200">
              <MonthlySolarChart
                data={monthlyTrendData}
                title="2. Monthly Solar Energy Generation"
              />
            </Card>

            {/* Chart 3: Solar Generation vs Electricity Consumption Comparison */}
            <Card className="hover:shadow-card-hover transition-shadow duration-200">
              <GenVsConsumptionChart
                data={filteredRecords}
                title="3. Solar Generation vs Electricity Consumption"
              />
            </Card>

            {/* Chart 4: Community-Wise Solar Generation Chart */}
            <Card className="hover:shadow-card-hover transition-shadow duration-200">
              <CommunitySolarChart
                data={DEMO_COMMUNITY_UNITS}
                title="4. Community-Wise Solar Generation"
              />
            </Card>
          </div>
        )}

        {/* ── Recent Energy Records Table ─────────────────────────────────── */}
        <Card className="p-0 overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-[#DCEBFA] flex items-center justify-between">
            <div>
              <h3 className="section-heading text-base">Recent Energy Records</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Latest logged daily generation and consumption measurements.
              </p>
            </div>
            <Link to="/records" className="text-xs text-[#2563EB] font-bold hover:underline">
              View All History →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA]">
                  <th className="px-5 py-3 text-left text-xs font-bold text-[#64748B] uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">Generated</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">Consumed</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">Utilized</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">Energy Balance</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">Est. Savings</th>
                  <th className="px-5 py-3 text-right text-xs font-bold text-[#64748B] uppercase tracking-wide">CO₂ Avoided</th>
                  <th className="px-5 py-3 text-center text-xs font-bold text-[#64748B] uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEBFA]/50">
                {recentRecords.map((r) => {
                  const balance = calcEnergyBalance(r.solar_generated_kwh, r.consumption_kwh)
                  const daySavings = calcCostSaved(r.solar_utilized_kwh, tariff)
                  const dayCO2 = calcCO2Avoided(r.solar_generated_kwh, emissionFactor)

                  return (
                    <tr key={r.id} className="hover:bg-[#EAF6FF]/50 transition-colors">
                      <td className="px-5 py-3 font-semibold text-[#153B65] whitespace-nowrap">
                        {formatDate(r.log_date)}
                        <span className="block text-[11px] text-[#64748B] font-normal">
                          {formatRelativeDate(r.log_date)}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[#0EA5E9] font-bold whitespace-nowrap">
                        {r.solar_generated_kwh} kWh
                      </td>
                      <td className="px-5 py-3 text-right text-[#2563EB] font-bold whitespace-nowrap">
                        {r.consumption_kwh} kWh
                      </td>
                      <td className="px-5 py-3 text-right text-[#153B65] font-semibold whitespace-nowrap">
                        {r.solar_utilized_kwh} kWh
                      </td>
                      <td className="px-5 py-3 text-right font-bold whitespace-nowrap">
                        <span className={balance >= 0 ? 'text-[#22C55E]' : 'text-red-500'}>
                          {balance >= 0 ? '+' : ''}{balance.toFixed(2)} kWh
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-[#2563EB] font-bold whitespace-nowrap">
                        ₹{daySavings.toFixed(2)}
                      </td>
                      <td className="px-5 py-3 text-right text-[#64748B] font-medium whitespace-nowrap">
                        {dayCO2.toFixed(2)} kg
                      </td>
                      <td className="px-5 py-3 text-center">
                        {r.is_demo && <Badge variant="demo">DEMO</Badge>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Transparent Calculation & Estimate Explanatory Box ───────────── */}
        <div className="bg-white rounded-2xl p-5 shadow-card border border-[#DCEBFA] flex items-start gap-3.5 text-xs text-[#64748B]">
          <Info size={18} className="text-[#0EA5E9] mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="font-bold text-[#153B65] text-sm">
              Important Calculation Methodology & Estimate Disclaimer
            </p>
            <p className="leading-relaxed">
              <strong>Electricity Bill Savings</strong> are estimated using solar energy actually utilized in-home (
              <code>Solar Utilized × ₹{tariff.toFixed(2)}/kWh tariff</code>), excluding surplus exported power unless credited under local net metering agreements.
            </p>
            <p className="leading-relaxed">
              <strong>CO₂ Emission Reduction</strong> is calculated from total clean solar electricity generated (
              <code>Solar Generated × {emissionFactor.toFixed(2)} kg CO₂/kWh</code>) based on the Central Electricity Authority grid displacement factor.
              Actual bill savings may vary with progressive DISCOM slab tariffs and fixed meter charges.
            </p>
          </div>
        </div>

        {/* ── Rates Configuration Modal ───────────────────────────────────── */}
        <Modal
          isOpen={configModalOpen}
          onClose={() => setConfigModalOpen(false)}
          title="Configure Calculation Rates"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-xs text-[#64748B]">
              Customize the electricity tariff and regional grid emission factor used for calculating bill savings and carbon offset estimates.
            </p>

            <div>
              <label className="form-label" htmlFor="tariff-input">
                Electricity Tariff (₹ per kWh)
              </label>
              <input
                id="tariff-input"
                type="number"
                step="0.1"
                min="1"
                max="30"
                value={tempTariff}
                onChange={(e) => setTempTariff(e.target.value)}
                className="form-input"
                placeholder="7.50"
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Typical residential average in India: ₹6.50 – ₹9.00 / kWh
              </p>
            </div>

            <div>
              <label className="form-label" htmlFor="factor-input">
                Grid Emission Factor (kg CO₂ per kWh)
              </label>
              <input
                id="factor-input"
                type="number"
                step="0.01"
                min="0.1"
                max="2.0"
                value={tempFactor}
                onChange={(e) => setTempFactor(e.target.value)}
                className="form-input"
                placeholder="0.82"
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                India national grid baseline (CEA FY 2022-23): 0.82 kg CO₂ / kWh
              </p>
            </div>

            <div className="pt-3 border-t border-[#DCEBFA] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setTempTariff(ELECTRICITY_RATE)
                  setTempFactor(CO2_FACTOR)
                }}
                className="text-xs text-[#2563EB] hover:underline font-bold"
              >
                Reset to Standards
              </button>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setConfigModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveConfig}>
                  Apply Rates
                </Button>
              </div>
            </div>
          </div>
        </Modal>
=======
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
      </PageWrapper>
    </AppLayout>
  )
}

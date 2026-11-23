/**
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

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            title={toast.title}
            onClose={() => setToast(null)}
          />
        )}
      </PageWrapper>
    </AppLayout>
  )
}

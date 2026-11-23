/**
 * AnalyticsPage.jsx — Detailed Solar Analytics & Deep-Dive Performance
 *
 * Implements:
 * 1. Generation Efficiency (kWh generated per kW capacity installed)
 * 2. Self-Consumption Ratio Breakdown
 * 3. Peak Generation Days & Lowest Generation Days
 * 4. Day-of-week Averages (Sunday through Saturday)
 * 5. Projected Annual Savings (based on average daily performance)
 * 6. System Payback Estimator (installed kW capacity cost vs annual savings)
 * 7. Clean empty state when zero records or setup exist.
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Zap, Sun, DollarSign, Calendar, SlidersHorizontal,
  ArrowRight, Award, ShieldCheck, Scale, BarChart2, CheckCircle2,
  AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { getEnergyLogs, getSolarSetup, getUserSettings } from '../../services/solarDataService'
import { calculateAggregatedAnalytics, calcCostSaved } from '../../utils/calculations'
import { formatDate } from '../../utils/formatters'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AnalyticsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [solarSetup, setSolarSetup] = useState(null)
  const [userSettings, setUserSettings] = useState(null)

  useEffect(() => {
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
        console.error('Failed to load analytics data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  // Analytics derived strictly from user data
  const stats = useMemo(() => {
    if (logs.length === 0) return null

    const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
    const factor = Number(userSettings?.grid_emission_factor ?? 0.82)
    const capacityKw = Number(solarSetup?.system_capacity_kw) || 0

    const agg = calculateAggregatedAnalytics(logs, tariff, factor)

    // 1. Generation Efficiency (kWh / kW capacity)
    const efficiency = capacityKw > 0 ? (agg.avgDailyGen / capacityKw) : null

    // 2. Peak & Lowest Generation Days
    const sortedByGen = [...logs].sort((a, b) => b.solar_generated_kwh - a.solar_generated_kwh)
    const peakDay = sortedByGen[0] || null
    const lowestDay = sortedByGen[sortedByGen.length - 1] || null

    // 3. Day of week averages
    const dayBuckets = Array.from({ length: 7 }, () => ({ total: 0, count: 0 }))
    logs.forEach((log) => {
      const dayIdx = new Date(log.log_date + 'T12:00:00').getDay()
      dayBuckets[dayIdx].total += Number(log.solar_generated_kwh) || 0
      dayBuckets[dayIdx].count += 1
    })

    const dayOfWeekData = DAYS_OF_WEEK.map((name, idx) => ({
      day: name.slice(0, 3),
      fullName: name,
      avgGen: dayBuckets[idx].count > 0 ? parseFloat((dayBuckets[idx].total / dayBuckets[idx].count).toFixed(2)) : 0,
      count: dayBuckets[idx].count,
    }))

    // 4. Projected Annual Savings
    const projectedAnnualSavings = agg.avgDailySavings * 365

    // 5. System Payback Estimator (Standard rooftop solar in India: ~₹55,000 per kW)
    const estimatedSystemCost = capacityKw > 0 ? capacityKw * 55000 : null
    const estimatedPaybackYears = (estimatedSystemCost && projectedAnnualSavings > 0)
      ? parseFloat((estimatedSystemCost / projectedAnnualSavings).toFixed(1))
      : null

    return {
      agg,
      efficiency,
      capacityKw,
      peakDay,
      lowestDay,
      dayOfWeekData,
      projectedAnnualSavings,
      estimatedSystemCost,
      estimatedPaybackYears,
    }
  }, [logs, solarSetup, userSettings])

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (logs.length === 0) {
    return (
      <AppLayout>
        <PageWrapper
          title="Performance Analytics"
          subtitle="Deep-dive efficiency metrics and financial forecasting."
        >
          <div className="max-w-2xl mx-auto py-12">
            <EmptyState
              icon={TrendingUp}
              title="No Analytics Available Yet"
              description="Analytics require at least one logged energy reading to compute generation efficiency, day-of-week averages, and payback forecasts."
              action={
                <div className="flex items-center gap-3">
                  <Link to="/setup">
                    <Button variant="outline" size="sm" className="text-xs">
                      Set Up Solar System
                    </Button>
                  </Link>
                  <Link to="/log">
                    <Button variant="primary" size="sm" className="text-xs">
                      Log First Day's Reading
                    </Button>
                  </Link>
                </div>
              }
            />
          </div>
        </PageWrapper>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageWrapper
        title="Performance Analytics"
        subtitle="Automated technical efficiency analysis and investment payback projections."
      >
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Generation Efficiency */}
          <Card className="border border-[#DCEBFA] p-5 shadow-xs bg-white">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold mb-2">
              <span>Generation Efficiency</span>
              <Sun size={17} className="text-[#0EA5E9]" />
            </div>
            {stats.efficiency !== null ? (
              <div>
                <div className="text-3xl font-extrabold text-[#153B65] tracking-tight">
                  {stats.efficiency.toFixed(2)}{' '}
                  <span className="text-xs font-semibold text-[#64748B]">kWh / kWp / day</span>
                </div>
                <p className="text-xs text-[#64748B] mt-1.5">
                  Rated capacity: <strong>{stats.capacityKw} kW</strong>
                </p>
                <div className="mt-3 p-2.5 rounded-xl bg-[#EAF6FF] text-[11px] text-[#2563EB] font-medium">
                  {stats.efficiency >= 4.0 ? 'Optimal tier performance in India' : 'Typical tier generation'}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-[#64748B]">Capacity not configured in setup.</p>
                <Link to="/setup" className="text-xs font-bold text-[#2563EB] underline block">
                  Add solar capacity to unlock
                </Link>
              </div>
            )}
          </Card>

          {/* Self-Consumption Ratio */}
          <Card className="border border-[#DCEBFA] p-5 shadow-xs bg-white">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold mb-2">
              <span>Self-Consumption Ratio</span>
              <Zap size={17} className="text-[#22C55E]" />
            </div>
            <div className="text-3xl font-extrabold text-[#22C55E] tracking-tight">
              {stats.agg.selfSufficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-[#64748B] mt-1.5">
              Utilized: <strong>{stats.agg.totalUtilized.toFixed(1)} kWh</strong> of {stats.agg.totalCon.toFixed(1)} kWh
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-[#F4FAFF] text-[11px] text-[#64748B]">
              Grid dependency: <strong>{stats.agg.gridDependency.toFixed(1)}%</strong>
            </div>
          </Card>

          {/* Projected Annual Savings */}
          <Card className="border border-[#DCEBFA] p-5 shadow-xs bg-white">
            <div className="flex items-center justify-between text-[#64748B] text-xs font-semibold mb-2">
              <span>Projected Annual Savings</span>
              <DollarSign size={17} className="text-[#2563EB]" />
            </div>
            <div className="text-3xl font-extrabold text-[#2563EB] tracking-tight">
              ₹{stats.projectedAnnualSavings.toFixed(0)}{' '}
              <span className="text-xs font-semibold text-[#64748B]">/ year</span>
            </div>
            <p className="text-xs text-[#64748B] mt-1.5">
              Daily avg savings: ₹{stats.agg.avgDailySavings.toFixed(1)}
            </p>
            <div className="mt-3 p-2.5 rounded-xl bg-[#EAF6FF] text-[11px] text-[#153B65]">
              At current tariff ₹{Number(userSettings?.electricity_tariff_inr ?? 7.50).toFixed(2)} / kWh
            </div>
          </Card>
        </div>

        {/* Deep Dive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Day of Week Generation Chart */}
          <Card className="border border-[#DCEBFA] shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">Day-of-Week Performance</h3>
                <p className="text-[11px] text-[#64748B]">Average solar generation by day of the week</p>
              </div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.dayOfWeekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} unit=" kWh" />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12 }}
                    formatter={(val) => [`${Number(val).toFixed(2)} kWh`, 'Avg Generation']}
                  />
                  <Bar dataKey="avgGen" name="Average kWh" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Peak vs Lowest Record Highlight */}
          <div className="space-y-6">
            <Card className="border border-[#DCEBFA] p-5 shadow-xs">
              <h3 className="text-sm font-bold text-[#153B65] mb-4">Record Highs & Lows</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Peak Day */}
                <div className="p-4 rounded-xl bg-[#EAF6FF]/60 border border-[#DCEBFA]">
                  <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wide block">
                    Highest Generation Day
                  </span>
                  <div className="text-2xl font-extrabold text-[#153B65] mt-1">
                    {Number(stats.peakDay?.solar_generated_kwh).toFixed(2)}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">kWh</span>
                  </div>
                  <span className="text-xs text-[#64748B] block mt-1">
                    {formatDate(stats.peakDay?.log_date)}
                  </span>
                </div>

                {/* Lowest Day */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wide block">
                    Lowest Generation Day
                  </span>
                  <div className="text-2xl font-extrabold text-[#153B65] mt-1">
                    {Number(stats.lowestDay?.solar_generated_kwh).toFixed(2)}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">kWh</span>
                  </div>
                  <span className="text-xs text-[#64748B] block mt-1">
                    {formatDate(stats.lowestDay?.log_date)}
                  </span>
                </div>
              </div>
            </Card>

            {/* System Payback Estimator */}
            <Card className="border border-[#DCEBFA] p-5 shadow-xs bg-gradient-to-br from-white to-[#F4FAFF]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#153B65]">Estimated System Payback</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0EA5E9] bg-white px-2 py-0.5 rounded-md border border-[#DCEBFA]">
                  ROI Analysis
                </span>
              </div>
              {stats.estimatedPaybackYears !== null ? (
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-[#22C55E]">
                      ~{stats.estimatedPaybackYears}
                    </span>
                    <span className="text-sm font-bold text-[#153B65]">Years to Full Payback</span>
                  </div>
                  <div className="text-xs text-[#64748B] space-y-1">
                    <p>Estimated system cost: <strong>₹{stats.estimatedSystemCost?.toLocaleString()}</strong> (~₹55,000/kW benchmark)</p>
                    <p>Annual bill reduction: <strong>₹{stats.projectedAnnualSavings.toFixed(0)}/year</strong></p>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed pt-2 border-t border-[#DCEBFA]">
                    Excludes additional MNRE central rooftop solar subsidies which can accelerate payback to 3.5 - 4.5 years.
                  </p>
                </div>
              ) : (
                <div className="text-xs text-[#64748B]">
                  Configure your system capacity in <Link to="/setup" className="text-[#2563EB] font-bold underline">My Solar Setup</Link> to calculate your estimated payback period.
                </div>
              )}
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AppLayout>
  )
}


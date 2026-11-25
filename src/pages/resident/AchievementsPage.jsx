/**
 * AchievementsPage.jsx — Environmental Impact Calculator & Sustainability Hub
 *
 * Implements the complete Environmental Impact Calculator for SolarConnect:
 * - Configurable Inputs:
 *   * Solar energy generated in kWh
 *   * Solar energy utilized in kWh (with validation: utilized <= generated)
 *   * Electricity tariff in INR per kWh
 *   * Grid emission factor in kg CO2 per kWh
 *
 * - Accurate Calculations:
 *   1. Estimated monetary savings: Utilized × Tariff
 *   2. Estimated CO2 avoided: Utilized × Grid Emission Factor
 *   3. Monthly impact: Monthly utilization & CO2 reduction
 *   4. Annual impact: Annual utilization & CO2 reduction
 *
 * - Display:
 *   * Total estimated money saved (Daily, Monthly, Annual)
 *   * Total estimated CO2 emissions avoided (Daily, Monthly, Annual)
 *   * Solar electricity utilized
 *   * Monthly environmental impact chart
 *   * Annual environmental impact chart
 *   * Visual environmental impact section with verified equivalents (Trees, Coal, Driving km)
 *   * Clear methodology explanation & disclaimer (explaining that utilized solar displaces grid power)
 *   * Tab to also view Community Milestones & Achievements
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Leaf, Sun, DollarSign, Zap, Sliders, Info, Trees, Flame,
  Car, RefreshCw, Trophy, Award, Star, CheckCircle2, AlertTriangle,
  ArrowRight, ShieldCheck, Scale, Sparkles,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import MonthlyImpactChart from '../../components/charts/MonthlyImpactChart'
import AnnualImpactChart from '../../components/charts/AnnualImpactChart'
import { getStoredRecords } from '../../services/energyStorageService'
import { DEMO_ACHIEVEMENTS } from '../../data/demoData'
import { ELECTRICITY_RATE, CO2_FACTOR } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState('calculator') // 'calculator' | 'achievements'

  // ─── Calculator Inputs State ───────────────────────────────────────────────
  const [genKwh, setGenKwh] = useState('15.0')
  const [utilizedKwh, setUtilizedKwh] = useState('12.0')
  const [tariff, setTariff] = useState(() => {
    const saved = localStorage.getItem('solarconnect_tariff')
    return saved !== null ? parseFloat(saved) : ELECTRICITY_RATE
  })
  const [emissionFactor, setEmissionFactor] = useState(() => {
    const saved = localStorage.getItem('solarconnect_emission_factor')
    return saved !== null ? parseFloat(saved) : CO2_FACTOR
  })

  // Numeric parsing
  const numGen = Math.max(0, parseFloat(genKwh) || 0)
  const numUtilized = Math.max(0, parseFloat(utilizedKwh) || 0)
  const numTariff = Math.max(0.1, parseFloat(tariff) || ELECTRICITY_RATE)
  const numFactor = Math.max(0.1, parseFloat(emissionFactor) || CO2_FACTOR)

  // Validation state: utilized cannot exceed generated
  const isUtilizedInvalid = numUtilized > numGen

  // Quick Presets
  const applyPreset = (gen, uti) => {
    setGenKwh(gen.toString())
    setUtilizedKwh(uti.toString())
  }

  // Load user logged average from local storage
  const handleLoadUserAverage = () => {
    const records = getStoredRecords()
    if (records.length > 0) {
      let sumGen = 0
      let sumUti = 0
      records.forEach((r) => {
        sumGen += Number(r.solar_generated_kwh) || 0
        sumUti += Number(r.solar_utilized_kwh) || 0
      })
      const avgGen = (sumGen / records.length).toFixed(1)
      const avgUti = (sumUti / records.length).toFixed(1)
      setGenKwh(avgGen)
      setUtilizedKwh(avgUti)
    }
  }

  // ─── Mathematical Calculations (Using Solar Utilized) ──────────────────────
  const calculations = useMemo(() => {
    const effectiveUtilized = isUtilizedInvalid ? numGen : numUtilized

    // 1. Daily
    const dailySavings = effectiveUtilized * numTariff
    const dailyCO2 = effectiveUtilized * numFactor

    // 2. Monthly (30-day baseline)
    const monthlyUtilized = effectiveUtilized * 30
    const monthlySavings = monthlyUtilized * numTariff
    const monthlyCO2 = monthlyUtilized * numFactor

    // 3. Annual (365-day baseline)
    const annualUtilized = effectiveUtilized * 365
    const annualSavings = annualUtilized * numTariff
    const annualCO2 = annualUtilized * numFactor

    // Visual Environmental Equivalencies (Using verified standard factors):
    // - Tree absorption: ~21 kg CO2 absorbed per mature tree per year (IPCC / ICFRE)
    // - Coal combustion avoided: ~0.62 kg coal burned per kWh generated at thermal stations (CEA India)
    // - Passenger vehicle distance: ~0.16 kg CO2 per km for a standard passenger car (BEE / US EPA)
    const annualTreesEquivalent = Math.round(annualCO2 / 21)
    const annualCoalAvoidedKg = Math.round(annualUtilized * 0.62)
    const annualCarKmDisplaced = Math.round(annualCO2 / 0.16)

    return {
      daily: {
        utilized: effectiveUtilized,
        savings: parseFloat(dailySavings.toFixed(2)),
        co2: parseFloat(dailyCO2.toFixed(2)),
      },
      monthly: {
        utilized: parseFloat(monthlyUtilized.toFixed(1)),
        savings: Math.round(monthlySavings),
        co2: parseFloat(monthlyCO2.toFixed(1)),
      },
      annual: {
        utilized: parseFloat(annualUtilized.toFixed(0)),
        savings: Math.round(annualSavings),
        co2: parseFloat(annualCO2.toFixed(1)),
        co2Tonnes: parseFloat((annualCO2 / 1000).toFixed(2)),
      },
      equivalents: {
        trees: annualTreesEquivalent,
        coalKg: annualCoalAvoidedKg,
        carKm: annualCarKmDisplaced,
      },
    }
  }, [numGen, numUtilized, numTariff, numFactor, isUtilizedInvalid])

  return (
    <AppLayout>
      <PageWrapper
        title="Environmental Impact Calculator"
        subtitle="Quantify the ecological and financial benefits of your solar energy utilization using verified regional factors."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'calculator'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#DCEBFA] text-[#64748B] hover:bg-[#EAF6FF] hover:text-[#2563EB]'
              }`}
            >
              Impact Calculator
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                activeTab === 'achievements'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'bg-white border border-[#DCEBFA] text-[#64748B] hover:bg-[#EAF6FF] hover:text-[#2563EB]'
              }`}
            >
              <Trophy size={13} /> Community Milestones
            </button>
          </div>
        }
      >
        {activeTab === 'achievements' ? (
          /* ── Community Achievements Tab ───────────────────────────────── */
          <div>
            <div className="bg-[#EAF6FF] rounded-2xl p-5 border border-[#DCEBFA] mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-[#153B65]">Community Sustainability Milestones</h3>
                <p className="text-xs text-[#153B65]/80 mt-0.5">
                  Celebrate our community's shared accomplishments towards cleaner skies and local energy independence.
                </p>
              </div>
              <Badge variant="eco">{DEMO_ACHIEVEMENTS.length} Milestones</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_ACHIEVEMENTS.map((a) => (
                <div
                  key={a.id}
                  className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] hover:shadow-card-hover hover:border-[#87CEEB] transition-all"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#0EA5E9] shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#22C55E] bg-[#F0FDF4] border border-[#DCFCE7] px-2 py-0.5 rounded-full mb-1">
                        ✓ Community Unlocked
                      </span>
                      <h4 className="font-bold text-[#153B65] text-sm">{a.title}</h4>
                      <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{a.description}</p>
                      <p className="text-[11px] text-[#64748B] mt-2">Achieved on {formatDate(a.achieved_at)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* ── Interactive Environmental Impact Calculator ──────────────── */
          <div>
            {/* ── Inputs Card ─────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-[#DCEBFA] mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-[#DCEBFA]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] flex items-center justify-center text-[#2563EB] border border-[#DCEBFA]">
                    <Sliders size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#153B65]">Simulation Inputs</h3>
                    <p className="text-xs text-[#64748B]">
                      Adjust your daily generation, utilization, and configurable regional tariff factors.
                    </p>
                  </div>
                </div>

                {/* Preset shortcuts */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-[#64748B] uppercase mr-1">Presets:</span>
                  <button
                    onClick={() => applyPreset(4.2, 3.5)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4FAFF] hover:bg-[#EAF6FF] hover:text-[#2563EB] text-[#64748B] text-xs border border-[#DCEBFA] font-medium transition-colors"
                  >
                    1 kW System
                  </button>
                  <button
                    onClick={() => applyPreset(12.5, 10.0)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4FAFF] hover:bg-[#EAF6FF] hover:text-[#2563EB] text-[#64748B] text-xs border border-[#DCEBFA] font-medium transition-colors"
                  >
                    3 kW System
                  </button>
                  <button
                    onClick={() => applyPreset(21.0, 16.5)}
                    className="px-2.5 py-1 rounded-lg bg-[#F4FAFF] hover:bg-[#EAF6FF] hover:text-[#2563EB] text-[#64748B] text-xs border border-[#DCEBFA] font-medium transition-colors"
                  >
                    5 kW System
                  </button>
                  <button
                    onClick={handleLoadUserAverage}
                    className="px-2.5 py-1 rounded-lg bg-[#EAF6FF] text-[#2563EB] text-xs border border-[#DCEBFA] font-semibold flex items-center gap-1 hover:bg-[#DCEBFA] transition-colors"
                    title="Pull average from tracking module"
                  >
                    <RefreshCw size={11} /> Load My Average
                  </button>
                </div>
              </div>

              {/* 4 Inputs Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Solar Energy Generated */}
                <div>
                  <label className="form-label" htmlFor="calc-gen">
                    Solar Generated (kWh / day)
                  </label>
                  <div className="relative">
                    <Sun size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0EA5E9]" />
                    <input
                      id="calc-gen"
                      type="number"
                      step="0.1"
                      min="0"
                      value={genKwh}
                      onChange={(e) => setGenKwh(e.target.value)}
                      className="form-input pl-9 font-semibold text-[#153B65] bg-[#F4FAFF] border-[#DCEBFA] focus:bg-white"
                      placeholder="15.0"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">Total daily gross panel output</p>
                </div>

                {/* 2. Solar Energy Utilized */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label mb-0" htmlFor="calc-uti">
                      Solar Utilized (kWh / day)
                    </label>
                    <button
                      type="button"
                      onClick={() => setUtilizedKwh(genKwh)}
                      className="text-[10px] text-[#2563EB] font-bold hover:underline"
                    >
                      Set to 100%
                    </button>
                  </div>
                  <div className="relative">
                    <Zap size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2563EB]" />
                    <input
                      id="calc-uti"
                      type="number"
                      step="0.1"
                      min="0"
                      value={utilizedKwh}
                      onChange={(e) => setUtilizedKwh(e.target.value)}
                      className={`form-input pl-9 font-semibold text-[#153B65] bg-[#F4FAFF] border-[#DCEBFA] focus:bg-white ${
                        isUtilizedInvalid ? 'border-red-400 focus:ring-red-300' : ''
                      }`}
                      placeholder="12.0"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">Solar power consumed in-home</p>
                </div>

                {/* 3. Configurable Electricity Tariff */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label mb-0" htmlFor="calc-tariff">
                      Electricity Tariff (₹ / kWh)
                    </label>
                    <button
                      type="button"
                      onClick={() => setTariff(ELECTRICITY_RATE)}
                      className="text-[10px] text-[#64748B] hover:text-[#2563EB]"
                    >
                      Reset (₹7.50)
                    </button>
                  </div>
                  <div className="relative">
                    <DollarSign size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2563EB]" />
                    <input
                      id="calc-tariff"
                      type="number"
                      step="0.1"
                      min="1"
                      value={tariff}
                      onChange={(e) => setTariff(e.target.value)}
                      className="form-input pl-9 font-semibold text-[#153B65] bg-[#F4FAFF] border-[#DCEBFA] focus:bg-white"
                      placeholder="7.50"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">Configurable utility grid rate</p>
                </div>

                {/* 4. Configurable Emission Factor */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="form-label mb-0" htmlFor="calc-factor">
                      Emission Factor (kg CO₂ / kWh)
                    </label>
                    <button
                      type="button"
                      onClick={() => setEmissionFactor(CO2_FACTOR)}
                      className="text-[10px] text-[#64748B] hover:text-[#2563EB]"
                    >
                      Reset (0.82)
                    </button>
                  </div>
                  <div className="relative">
                    <Leaf size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#0EA5E9]" />
                    <input
                      id="calc-factor"
                      type="number"
                      step="0.01"
                      min="0.1"
                      max="2.0"
                      value={emissionFactor}
                      onChange={(e) => setEmissionFactor(e.target.value)}
                      className="form-input pl-9 font-semibold text-[#153B65] bg-[#F4FAFF] border-[#DCEBFA] focus:bg-white"
                      placeholder="0.82"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">National CEA grid baseline</p>
                </div>
              </div>

              {/* Validation Warning when Utilized > Generated */}
              {isUtilizedInvalid && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500 shrink-0" />
                  <span>
                    <strong>Validation Warning:</strong> Solar energy utilized ({numUtilized} kWh) cannot exceed total solar generated ({numGen} kWh).
                    Calculations temporarily clamped to {numGen} kWh.
                  </span>
                </div>
              )}
            </div>

            {/* ── Key Impact Metrics Display ─────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
              {/* Metric 1: Total Estimated Money Saved */}
              <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Estimated Money Saved
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#153B65] mb-1">
                  ₹{calculations.annual.savings.toLocaleString()}
                  <span className="text-xs font-medium text-[#64748B] ml-1">/ year</span>
                </div>
                <div className="pt-2 border-t border-[#DCEBFA] flex justify-between text-xs text-[#64748B]">
                  <span>Monthly: <strong className="text-[#153B65] font-semibold">₹{calculations.monthly.savings.toLocaleString()}</strong></span>
                  <span>Daily: <strong className="text-[#153B65] font-semibold">₹{calculations.daily.savings.toFixed(0)}</strong></span>
                </div>
              </div>

              {/* Metric 2: Total Estimated CO2 Avoided */}
              <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Estimated CO₂ Avoided
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center">
                    <Leaf size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#22C55E] mb-1">
                  {calculations.annual.co2Tonnes}
                  <span className="text-sm font-medium text-[#64748B] ml-1">tonnes / year</span>
                </div>
                <div className="pt-2 border-t border-[#DCEBFA] flex justify-between text-xs text-[#64748B]">
                  <span>Monthly: <strong className="text-[#153B65] font-semibold">{calculations.monthly.co2} kg</strong></span>
                  <span>Daily: <strong className="text-[#153B65] font-semibold">{calculations.daily.co2} kg</strong></span>
                </div>
              </div>

              {/* Metric 3: Solar Electricity Utilized */}
              <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">
                    Solar Energy Utilized
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center">
                    <Zap size={16} />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-[#153B65] mb-1">
                  {calculations.annual.utilized.toLocaleString()}
                  <span className="text-sm font-medium text-[#64748B] ml-1">kWh / year</span>
                </div>
                <div className="pt-2 border-t border-[#DCEBFA] flex justify-between text-xs text-[#64748B]">
                  <span>Monthly: <strong className="text-[#153B65] font-semibold">{calculations.monthly.utilized} kWh</strong></span>
                  <span>Daily: <strong className="text-[#153B65] font-semibold">{calculations.daily.utilized} kWh</strong></span>
                </div>
              </div>
            </div>

            {/* ── Visual Environmental Equivalencies Section ────────────────── */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-[#DCEBFA] mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-[#0EA5E9]" />
                <h3 className="section-heading text-base text-[#153B65]">Visual Environmental Impact (Annual Equivalence)</h3>
                <span className="text-xs text-[#64748B] ml-auto">Standard verified benchmarks</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Trees Equivalent */}
                <div className="bg-[#F4FAFF] rounded-xl p-4 border border-[#DCEBFA] flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#22C55E] border border-[#DCEBFA] flex items-center justify-center shrink-0">
                    <Trees size={20} />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#22C55E] leading-none block mb-1">
                      {calculations.equivalents.trees.toLocaleString()}
                    </span>
                    <p className="text-xs font-semibold text-[#153B65]">Mature Trees Absorbing CO₂</p>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      Based on average adult tree absorption of ~21 kg CO₂ per year (IPCC/ICFRE standard).
                    </p>
                  </div>
                </div>

                {/* 2. Coal Burning Avoided */}
                <div className="bg-[#F4FAFF] rounded-xl p-4 border border-[#DCEBFA] flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center shrink-0">
                    <Flame size={20} />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#153B65] leading-none block mb-1">
                      {calculations.equivalents.coalKg.toLocaleString()} kg
                    </span>
                    <p className="text-xs font-semibold text-[#153B65]">Thermal Coal Combustion Avoided</p>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      Displacing thermal station combustion at ~0.62 kg domestic coal per kWh (CEA India).
                    </p>
                  </div>
                </div>

                {/* 3. Passenger Vehicle Kilometers Displaced */}
                <div className="bg-[#F4FAFF] rounded-xl p-4 border border-[#DCEBFA] flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center shrink-0">
                    <Car size={20} />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#153B65] leading-none block mb-1">
                      {calculations.equivalents.carKm.toLocaleString()} km
                    </span>
                    <p className="text-xs font-semibold text-[#153B65]">Passenger Car Distance Offset</p>
                    <p className="text-[11px] text-[#64748B] mt-1 leading-snug">
                      Equivalent to avoiding emissions from an average gasoline passenger vehicle (160 g CO₂/km).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Monthly & Annual Charts ───────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
              {/* Monthly Chart */}
              <Card className="hover:shadow-card-hover hover:border-[#87CEEB] transition-all border border-[#DCEBFA]">
                <MonthlyImpactChart
                  monthlyUtilizedKwh={calculations.monthly.utilized}
                  emissionFactor={numFactor}
                  title="Monthly Environmental Impact (12-Month Projection)"
                />
              </Card>

              {/* Annual Chart */}
              <Card className="hover:shadow-card-hover hover:border-[#87CEEB] transition-all border border-[#DCEBFA]">
                <AnnualImpactChart
                  annualUtilizedKwh={calculations.annual.utilized}
                  emissionFactor={numFactor}
                  title="Annual Impact Trajectory (Multi-Year Cumulative)"
                />
              </Card>
            </div>

            {/* ── Calculation Methodology & Disclaimer Section ───────────────── */}
            <div className="bg-white rounded-2xl shadow-card p-6 border border-[#DCEBFA]">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-[#2563EB] shrink-0 mt-0.5" />
                <div className="space-y-2 text-xs text-[#64748B] leading-relaxed">
                  <h4 className="font-bold text-sm text-[#153B65]">
                    Calculation Methodology & Environmental Disclaimer
                  </h4>
                  <p>
                    <strong>Why Solar Utilized is used for emission reductions:</strong> Generated solar electricity is not
                    automatically equivalent to avoided grid electricity. Only solar electricity actually <em>utilized in-home</em> directly
                    displaces fossil fuel power drawn from the regional utility grid. Surplus solar exported into the grid may experience
                    curtailment or offset varied base-load energy depending on state grid dispatch dynamics.
                  </p>
                  <p>
                    <strong>Estimated Monetary Savings:</strong> Computed as <code>Solar Utilized (kWh) × Configurable Tariff (₹{numTariff.toFixed(2)}/kWh)</code>.
                    Actual electricity bill savings may vary depending on progressive tier pricing slabs, fixed connected-load surcharges, and state DISCOM net-metering banking policies.
                  </p>
                  <p>
                    <strong>Grid Emission Baseline:</strong> Uses the Central Electricity Authority (CEA) CO₂ Baseline Database for the Indian National Grid
                    (default factor: <code>0.82 kg CO₂ / kWh</code>). Users can customize this factor based on their specific state grid or renewable mix.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </PageWrapper>
    </AppLayout>
  )
}

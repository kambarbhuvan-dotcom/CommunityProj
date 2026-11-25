/**
 * LandingPage.jsx — Sky-Inspired White & Blue Landing Page
<<<<<<< HEAD
 * Visual Identity:
 * - White & Pale Blue (#EAF6FF) hero section with soft sky-blue gradients
 * - Large Navy Blue (#153B65) heading with Primary Blue (#2563EB) accents
 * - Primary Blue CTA button (#2563EB) with smooth hover
 * - Clean feature cards, step guides, and privacy highlights
 */
import { Link } from 'react-router-dom'
import { Sun, Zap, Leaf, BarChart3, BookOpen, Users, ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import Footer from '../../components/layout/Footer'
import SolarCommunity3D from '../../components/SolarCommunity3D'

const stats = [
  { label: 'kWh Generated (Demo)', value: '24,205' },
  { label: 'CO₂ Avoided (Demo)',   value: '15.9 t' },
  { label: 'Residents Tracking',   value: '48+' },
  { label: 'Avg. Savings/Month',   value: '₹2,490' },
]

const features = [
  { icon: BarChart3, title: 'Solar Dashboard',    desc: 'See your daily generation, consumption, and savings at a glance.' },
  { icon: Zap,       title: 'Energy Tracking',    desc: 'Log solar generation and consumption with simple, validated forms.' },
  { icon: Leaf,      title: 'CO₂ Impact',         desc: 'Measure verified carbon emissions avoided using regional CEA grid factors.' },
  { icon: Sun,       title: 'Cost Savings',       desc: 'Track exact monetary savings from clean solar electricity utilized in-home.' },
  { icon: BookOpen,  title: 'Solar Guides',       desc: 'Learn about solar panels, maintenance, and official government schemes.' },
  { icon: Users,     title: 'Community Stats',    desc: 'Compare aggregated community performance with 100% individual privacy.' },
]

const steps = [
  { step: '01', title: 'Create an Account',   desc: 'Sign up with your residential email and choose your community building.' },
  { step: '02', title: 'Log Your Energy',     desc: 'Enter daily generation and consumption readings in seconds.' },
  { step: '03', title: 'Track Your Impact',   desc: 'Watch your financial bill savings and environmental offsets grow.' },
]

const benefits = [
  'Accurate savings computed from solar electricity actually utilized',
  'Aggregated community statistics with zero private meter exposure',
  'Comprehensive educational guides covering Indian solar initiatives',
  'Fully responsive interface designed for desktop, tablet, and mobile',
  'Verified demonstration dataset so the portal is never empty',
  'Strict role-based access control protecting resident records',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4FAFF] text-[#153B65]">
      {/* ── Top Navbar ───────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#DCEBFA]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
              <Sun size={17} className="text-white" />
            </div>
            <span className="font-extrabold text-[#153B65] text-lg tracking-tight">SolarConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hidden sm:block text-sm font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors">
              About Solar
            </Link>
            <Link to="/login" className="text-sm font-semibold text-[#153B65] hover:text-[#2563EB] transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-xs sm:text-sm px-4 py-2">
              Get Started Free
            </Link>
=======
 *
 * Visual Identity:
 * - Pure White & Pale Blue (#EAF6FF) palette with soft sky-blue gradients
 * - Navy Blue (#153B65) headings with Primary Blue (#2563EB) & Deep Sky Blue (#0EA5E9) accents
 * - Glassmorphic elevated cards (bg-white/80 backdrop-blur-sm border-sky-100)
 * - Interactive Live Community Solar Preview with real-time formula transparency
 * - Smart Navbar reflecting authenticated session state
 * - Full compliance with India CEA 0.82 kg CO2/kWh and DISCOM tariff benchmarks
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, Zap, Leaf, BarChart3, BookOpen, Users, ArrowRight,
  CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Sliders,
  Download, Layers, Lock, Activity, Info, User, LayoutDashboard,
  Check
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Footer from '../../components/layout/Footer'

// Sample community stats modeled on CEA 0.82 kg CO2/kWh and HESCOM tariffs
// 24,205 kWh * 0.82 kg/kWh = 19,848 kg = 19.8 t
const stats = [
  { label: 'Total Solar Generation', value: '24,205', unit: 'kWh' },
  { label: 'CO₂ Emissions Avoided',  value: '19.8',   unit: 't' },
  { label: 'Active Residents',        value: '48+',    unit: 'homes' },
  { label: 'Avg. Monthly Savings',    value: '₹2,490', unit: '/home' },
]

const features = [
  { icon: BarChart3, title: 'Solar Dashboard',    desc: 'See your daily generation, consumption, self-sufficiency, and savings at a glance.' },
  { icon: Zap,       title: 'Energy Tracking',    desc: 'Log inverter generation, export, and import with real-time physical balance validation.' },
  { icon: Leaf,      title: 'CO₂ Impact Engine',  desc: 'Measure verified carbon emissions avoided using India’s official 0.82 kg/kWh CEA factor.' },
  { icon: Sun,       title: 'Cost Savings',       desc: 'Track actual bill reductions based strictly on clean solar electricity utilized in-home.' },
  { icon: BookOpen,  title: 'Solar Guides & Tips',desc: 'Learn about net-metering, rooftop maintenance, and government PM Surya Ghar subsidies.' },
  { icon: Users,     title: 'Community Stats',    desc: 'Compare building-wide performance and green rankings with 100% individual privacy.' },
]

const steps = [
  {
    step: '01',
    title: 'Configure Your Rooftop',
    desc: 'Enter system kW capacity, panel type, and local DISCOM tariff rate (e.g. HESCOM, BESCOM, Tata Power).',
    badge: 'Step 1: Calibration',
    icon: Layers,
  },
  {
    step: '02',
    title: 'Log Daily Generation',
    desc: 'Record inverter output and grid import/export with automated mathematical energy balance verification.',
    badge: 'Step 2: Daily Readings',
    icon: Activity,
  },
  {
    step: '03',
    title: 'Track Savings & Community Impact',
    desc: 'Monitor rupees saved, net-metering exports, and CO₂ emissions avoided in real time on responsive charts.',
    badge: 'Step 3: Real-Time Intelligence',
    icon: TrendingUp,
  },
]

const pillars = [
  {
    icon: ShieldCheck,
    title: 'CEA India 0.82 kg/kWh Baseline',
    desc: 'Environmental offsets are calculated strictly against India’s Central Electricity Authority baseline grid emission factor.',
  },
  {
    icon: Activity,
    title: 'Zero-Fake-Data Verification',
    desc: 'All daily entries are verified through mathematical physical balance (Generation - Export + Import = Consumption).',
  },
  {
    icon: Download,
    title: 'Exportable CSV Energy Logs',
    desc: 'Download uncompressed, transparent raw timeseries logs at any time for local auditing and DISCOM billing verification.',
  },
  {
    icon: Lock,
    title: 'Resident Privacy by Design',
    desc: 'Community leaderboards and building aggregations protect individual households—no private meter readings are ever exposed.',
  },
]

export default function LandingPage() {
  const { user, profile, isAdmin } = useAuth()
  const [simGen, setSimGen] = useState(21.5)

  // Simulation calculations based on 21.5 kWh day
  // Household consumption: 18.2 kWh
  // In-home solar self-consumption: 12.0 kWh
  // Grid export: gen - selfUsed
  // Grid import: 18.2 - selfUsed = 6.2 kWh
  const tariffRate = 7.50 // HESCOM (Hubballi) INR / kWh
  const gridFactor = 0.82 // CEA kg CO2 / kWh
  const consumptionBaseline = 18.2

  const selfUsedKwh = parseFloat(Math.min(simGen, 12.0).toFixed(1))
  const exportedKwh = parseFloat(Math.max(0, simGen - selfUsedKwh).toFixed(1))
  const importedKwh = parseFloat(Math.max(0, consumptionBaseline - selfUsedKwh).toFixed(1))
  const moneySaved = (selfUsedKwh * tariffRate).toFixed(2)
  const co2Avoided = (selfUsedKwh * gridFactor).toFixed(2)
  const selfSufficiencyPct = Math.round((selfUsedKwh / consumptionBaseline) * 100)
  const solarGenExportPct = Math.round((exportedKwh / simGen) * 100)

  const handleScrollToSection = (e, id) => {
    e.preventDefault()
    const target = document.getElementById(id)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const userDisplayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Resident'
  const dashboardLink = isAdmin ? '/admin' : '/dashboard'

  return (
    <div className="min-h-screen bg-[#F4FAFF] text-[#153B65] selection:bg-[#EAF6FF] selection:text-[#2563EB]">
      {/* ── Top Navbar with Smart Auth State ─────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DCEBFA] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Sun size={17} className="text-white" />
            </div>
            <span className="font-extrabold text-[#153B65] text-lg tracking-tight">SolarConnect</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              onClick={(e) => handleScrollToSection(e, 'features')}
              className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              About Solar
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleScrollToSection(e, 'how-it-works')}
              className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              How It Works
            </a>
            <Link
              to="/learn"
              className="text-sm font-semibold text-[#64748B] hover:text-[#2563EB] transition-colors"
            >
              Solar Guides
            </Link>
          </div>

          {/* Smart Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAF6FF] border border-[#DCEBFA]">
                  <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px] font-bold">
                    <User size={11} />
                  </div>
                  <span className="text-xs font-bold text-[#153B65] max-w-[120px] truncate">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white text-[#2563EB] border border-[#DCEBFA]/80">
                    {isAdmin ? 'Admin' : 'Resident'}
                  </span>
                </div>

                <Link
                  to={dashboardLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-bold hover:bg-[#1D4ED8] transition-all shadow-xs hover:shadow-md"
                >
                  <LayoutDashboard size={14} className="shrink-0" />
                  <span>Go to Dashboard →</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-semibold text-[#153B65] hover:text-[#2563EB] transition-colors px-2 py-1"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-bold hover:bg-[#1D4ED8] transition-all shadow-xs hover:shadow-md"
                >
                  Get Started Free
                </Link>
              </div>
            )}
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
          </div>
        </div>
      </nav>

<<<<<<< HEAD
      {/* Immersive 3D community hero */}
      <section className="sc-public-hero">
        <div className="sc-public-glow sc-public-glow-a" /><div className="sc-public-glow sc-public-glow-b" />
        <div className="sc-public-hero-inner">
          <div className="sc-public-copy">
            <div className="sc-public-pill"><Sparkles size={14} /> Community clean-energy intelligence</div>
            <h1>Power your community <span>with the energy of the sun.</span></h1>
            <p>Explore rooftop solar generation, shared battery storage, household savings and the collective environmental impact of your community.</p>
            <div className="sc-public-actions">
              <Link to="/register" className="sc-public-primary">Get Started Free <ArrowRight size={17} /></Link>
              <Link to="/about" className="sc-public-secondary">Explore Solar Guides</Link>
            </div>
            <div className="sc-public-proof"><span><i /> Solar-powered homes</span><span><i /> Shared energy insights</span><span><i /> Resident-first privacy</span></div>
          </div>
          <div className="sc-public-scene">
            <div className="sc-scene-label"><span className="sc-live-dot" /> COMMUNITY MICRO-GRID <small>INTERACTIVE 3D · DRAG TO ROTATE</small></div>
            <SolarCommunity3D />
            <div className="sc-scene-float sc-scene-float-top"><span>☀</span><div><small>Clean energy</small><strong>Generated together</strong></div></div>
            <div className="sc-scene-float sc-scene-float-bottom"><span>⌁</span><div><small>Shared storage</small><strong>Smarter distribution</strong></div></div>
=======
      {/* ── Hero Section (Sky-Inspired Blue & White) ─────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#F4FAFF] to-[#EAF6FF] pt-16 pb-20 md:pt-20 md:pb-24 border-b border-[#DCEBFA]">
        {/* Soft background ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#87CEEB]/20 blur-3xl -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#0EA5E9]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-10">
            {/* Pill Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF6FF] border border-[#DCEBFA] text-xs font-bold text-[#2563EB] mb-5 shadow-xs">
              <Sparkles size={13} className="text-[#0EA5E9]" />
              Sky-Inspired Community Clean Energy Platform
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#153B65] leading-[1.12] tracking-tight mb-5">
              Power Your Community <br />
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] bg-clip-text text-transparent">
                with Clean Solar Energy
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#64748B] mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
              Track rooftop generation, monitor electricity bill savings, measure avoided carbon emissions,
              and empower residents with collaborative clean energy intelligence.
            </p>

            {/* Hero Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3.5">
              {user ? (
                <Link
                  to={dashboardLink}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg"
                >
                  <LayoutDashboard size={16} /> Open Your Dashboard <ArrowRight size={16} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#2563EB] text-white font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-md hover:shadow-lg"
                >
                  Get Started Free <ArrowRight size={16} />
                </Link>
              )}
              <Link
                to="/learn"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm border border-[#DCEBFA] hover:bg-[#EAF6FF] transition-colors shadow-xs"
              >
                <BookOpen size={16} className="text-[#0EA5E9]" />
                Explore Solar Guides
              </Link>
            </div>
          </div>

          {/* ── Live Community Solar Preview Card (Interactive) ──────────── */}
          <div className="max-w-4xl mx-auto mt-6">
            <div className="bg-white/90 backdrop-blur-md border border-sky-200/80 rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-[#DCEBFA]">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-[#153B65] tracking-tight">
                      Live Community Solar Preview
                    </h3>
                    <p className="text-xs text-[#64748B]">Real-time solar telemetry & self-consumption model</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF6FF] border border-[#DCEBFA] text-[11px] font-bold text-[#2563EB]">
                  <Info size={12} className="text-[#0EA5E9]" />
                  <span>HESCOM Tariff ₹7.50/kWh • CEA Factor 0.82 kg/kWh</span>
                </div>
              </div>

              {/* Slider for interactive generation */}
              <div className="mb-6 p-4 rounded-2xl bg-[#F4FAFF] border border-[#DCEBFA]">
                <div className="flex items-center justify-between text-xs font-bold text-[#153B65] mb-2">
                  <span className="flex items-center gap-1.5">
                    <Sliders size={14} className="text-[#2563EB]" />
                    Simulate Daily Inverter Output
                  </span>
                  <span className="text-[#2563EB] bg-white px-2 py-0.5 rounded-lg border border-[#DCEBFA]">
                    {simGen} kWh / day
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="35"
                  step="0.5"
                  value={simGen}
                  onChange={(e) => setSimGen(parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#DCEBFA] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-[10px] text-[#64748B] mt-1 font-medium">
                  <span>12.0 kWh (Cloudy)</span>
                  <span>21.5 kWh (Average Sunny)</span>
                  <span>35.0 kWh (Peak Summer)</span>
                </div>
              </div>

              {/* Key Preview Output Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mb-6">
                <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">Today's Generation</p>
                  <p className="text-2xl font-black text-[#0EA5E9]">
                    {simGen} <span className="text-xs font-medium text-[#64748B]">kWh</span>
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">100% Inverter output</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">Self-Consumed</p>
                  <p className="text-2xl font-black text-[#2563EB]">
                    {selfUsedKwh} <span className="text-xs font-medium text-[#64748B]">kWh</span>
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">{selfSufficiencyPct}% of consumption</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs bg-gradient-to-br from-white to-emerald-50/30">
                  <p className="text-xs font-semibold text-emerald-800 mb-1">Money Saved</p>
                  <p className="text-2xl font-black text-emerald-600">
                    ₹{moneySaved}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-1">Direct bill offset</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#DCEBFA] shadow-xs">
                  <p className="text-xs font-semibold text-[#64748B] mb-1">CO₂ Offset</p>
                  <p className="text-2xl font-black text-[#153B65]">
                    {co2Avoided} <span className="text-xs font-medium text-[#64748B]">kg</span>
                  </p>
                  <p className="text-[11px] text-[#64748B] mt-1">Avoided grid emissions</p>
                </div>
              </div>

              {/* Energy Flow & Formula Transparency Callout */}
              <div className="space-y-3 p-4 rounded-2xl bg-[#EAF6FF]/60 border border-[#DCEBFA]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#153B65]">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#DCEBFA]/70">
                    <span className="text-[#64748B]">Surplus Grid Export:</span>
                    <span className="font-extrabold text-[#0EA5E9]">{exportedKwh} kWh ({solarGenExportPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-[#DCEBFA]/70">
                    <span className="text-[#64748B]">Evening Grid Import:</span>
                    <span className="font-extrabold text-[#153B65]">{importedKwh} kWh (Baseline)</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 text-[11px] text-[#64748B] leading-relaxed">
                  <CheckCircle2 size={13} className="text-[#2563EB] shrink-0 mt-0.5" />
                  <span>
                    <strong>Formula Transparency:</strong> Monetary savings are derived exclusively from solar electricity consumed in-home ({selfUsedKwh} kWh × ₹7.50/kWh = ₹{moneySaved}), preventing misleading assumptions of 100% feed-in credit.
                  </span>
                </div>
              </div>
            </div>
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ── Key Metrics Bar ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#DCEBFA]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-[#2563EB] tracking-tight">{s.value}</p>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">{s.label}</p>
=======
      {/* ── Key Metrics Bar (Glassmorphic Elevated Cards) ───────────────── */}
      <section className="bg-white border-b border-[#DCEBFA] py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-white/80 backdrop-blur-sm border border-sky-100 rounded-2xl shadow-sm p-6 text-center hover:border-sky-300 hover:shadow-md transition-all group"
              >
                <p className="text-3xl sm:text-4xl font-black text-[#2563EB] tracking-tight group-hover:scale-105 transition-transform inline-block">
                  {s.value}
                </p>
                {s.unit && (
                  <span className="text-xs font-semibold text-[#64748B] ml-1.5">{s.unit}</span>
                )}
                <p className="text-xs font-bold text-[#153B65] uppercase tracking-wider mt-2">
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* Verification Badge */}
          <div className="mt-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] font-medium px-4 py-1.5 rounded-full bg-[#F4FAFF] border border-[#DCEBFA]">
              <Info size={13} className="text-[#2563EB]" />
              Sample community metrics modeled on CEA India 0.82 kg/kWh baseline & HESCOM tariffs.
            </span>
          </div>
        </div>
      </section>

      {/* ── Section 2 — How It Works (3-Step Cards) ─────────────────────── */}
      <section id="how-it-works" className="bg-[#EAF6FF]/50 border-b border-[#DCEBFA] py-20 scroll-mt-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DCEBFA] text-xs font-bold text-[#2563EB] mb-3 shadow-xs">
              Simple 3-Step Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#153B65] tracking-tight mb-3">
              How SolarConnect Works
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Designed for residential apartments and housing societies to eliminate paperwork, verify inverter data, and optimize power savings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, idx) => (
              <div
                key={s.step}
                className="bg-white rounded-3xl p-7 border border-[#DCEBFA] shadow-card hover:shadow-card-hover transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]">
                      {s.badge}
                    </span>
                    <span className="text-3xl font-black text-[#87CEEB]/60">{s.step}</span>
                  </div>

                  <div className="w-12 h-12 rounded-2xl bg-[#F4FAFF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB] mb-4">
                    <s.icon size={22} className="stroke-[2.2]" />
                  </div>

                  <h3 className="font-extrabold text-[#153B65] text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed mb-6">{s.desc}</p>
                </div>

                <div className="pt-4 border-t border-[#DCEBFA]/60 text-xs text-[#2563EB] font-bold flex items-center gap-1">
                  <span>Explore Feature</span>
                  <ArrowRight size={13} />
                </div>
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────── */}
<<<<<<< HEAD
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-extrabold text-[#153B65] tracking-tight mb-3">
            Everything your community needs
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            A purpose-built clean energy management portal designed for simplicity, accuracy, and resident privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card hover:shadow-card-hover transition-all duration-200">
              <div className="w-11 h-11 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mb-4">
=======
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 scroll-mt-12">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6FF] border border-[#DCEBFA] text-xs font-bold text-[#2563EB] mb-3">
            Comprehensive Platform Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#153B65] tracking-tight mb-3">
            Everything Your Community Needs
          </h2>
          <p className="text-[#64748B] max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            A purpose-built clean energy management portal designed for simplicity, mathematical accuracy, and resident privacy.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white rounded-2xl p-6 border border-[#DCEBFA] shadow-xs hover:shadow-card-hover hover:border-sky-300 transition-all duration-200 group"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
                <f.icon size={22} className="text-[#0EA5E9]" />
              </div>
              <h3 className="font-bold text-[#153B65] text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

<<<<<<< HEAD
      {/* ── How it works (Pale Blue Section Background) ─────────────────── */}
      <section className="bg-[#EAF6FF]/60 border-y border-[#DCEBFA] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-[#153B65] tracking-tight mb-3">
              How it works
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base">
              Start monitoring and optimizing your solar footprint in three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-7 left-full w-full h-0.5 bg-[#DCEBFA] z-0 -translate-x-8" />
                )}
                <div className="card relative z-10 p-6 bg-white border border-[#DCEBFA]">
                  <span className="text-3xl font-black text-[#87CEEB] block mb-2">{s.step}</span>
                  <h3 className="font-bold text-[#153B65] text-base mb-1.5">{s.title}</h3>
                  <p className="text-sm text-[#64748B] leading-relaxed">{s.desc}</p>
=======
      {/* ── Section 3 — Built-In Transparency & Accuracy Banner ─────────── */}
      <section className="bg-gradient-to-b from-[#F4FAFF] to-[#EAF6FF]/80 border-y border-[#DCEBFA] py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#DCEBFA] text-xs font-bold text-[#2563EB] mb-3 shadow-xs">
              <ShieldCheck size={14} className="text-[#0EA5E9]" />
              Core Engineering Standards
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#153B65] tracking-tight mb-3">
              Built-In Transparency & Data Integrity
            </h2>
            <p className="text-[#64748B] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              We eliminate imaginary estimates. SolarConnect enforces peer-reviewed physics formulas and regional Indian energy standards across every calculation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="bg-white rounded-2xl p-6 border border-[#DCEBFA] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB] mb-4">
                    <p.icon size={20} className="stroke-[2.2]" />
                  </div>
                  <h3 className="font-extrabold text-[#153B65] text-sm mb-2 leading-snug">{p.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed">{p.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#DCEBFA]/60 flex items-center gap-1 text-[11px] font-bold text-[#047857]">
                  <Check size={12} className="stroke-[3]" />
                  <span>Enforced by Engine</span>
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* ── Privacy & Calculation Accuracy Section ──────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF6FF] text-[#2563EB] text-xs font-bold mb-4 border border-[#DCEBFA]">
              <ShieldCheck size={14} /> Trust & Transparency
            </div>
            <h2 className="text-3xl font-black text-[#153B65] tracking-tight mb-4 leading-tight">
              Built with mathematical accuracy and resident privacy
            </h2>
            <p className="text-[#64748B] mb-6 leading-relaxed text-sm">
              SolarConnect calculates financial savings using clean solar electricity actually consumed at home,
              rather than assuming 100% feed-in parity. Community leaderboards use anonymized metrics so no resident's
              private meter is exposed.
            </p>
            <ul className="space-y-3">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-[#153B65] font-medium">
                  <CheckCircle2 size={16} className="text-[#2563EB] mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual Preview Card */}
          <div className="card shadow-card-hover p-7 bg-white border border-[#DCEBFA]">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCEBFA]">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Today's Performance</p>
                <p className="text-sm font-extrabold text-[#153B65]">Sky Energy Matrix</p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#EAF6FF] text-[#2563EB] text-[10px] font-bold border border-[#DCEBFA]">
                VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {[
                { label: 'Generated', value: '24.5', unit: 'kWh', color: 'text-[#0EA5E9]' },
                { label: 'Consumed',  value: '19.8', unit: 'kWh', color: 'text-[#2563EB]' },
                { label: 'Saved',     value: '₹148.50', unit: '', color: 'text-[#22C55E]' },
                { label: 'CO₂ Avoided', value: '16.2', unit: 'kg', color: 'text-[#0EA5E9]' },
              ].map((item) => (
                <div key={item.label} className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-3.5">
                  <p className="text-xs text-[#64748B] font-medium mb-1">{item.label}</p>
                  <p className={`text-xl font-black ${item.color}`}>
                    {item.value}
                    <span className="text-xs font-normal text-[#64748B] ml-1">{item.unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final Call To Action ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#153B65] via-[#1E4E85] to-[#2563EB] py-20 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
=======
      {/* ── Final Call To Action ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#153B65] via-[#1E4E85] to-[#2563EB] py-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-sky-400/10 blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Ready to track your community's clean energy?
          </h2>
          <p className="text-[#DCEBFA] mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Join your residential neighborhood on SolarConnect today. Clean, transparent, and completely free.
          </p>
<<<<<<< HEAD
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm hover:bg-[#EAF6FF] transition-all shadow-lg hover:shadow-xl">
            Join Your Community <ArrowRight size={16} />
          </Link>
        </div>
      </section>

=======
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {user ? (
              <Link
                to={dashboardLink}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm hover:bg-[#EAF6FF] transition-all shadow-lg hover:shadow-xl"
              >
                <LayoutDashboard size={16} /> Open Resident Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm hover:bg-[#EAF6FF] transition-all shadow-lg hover:shadow-xl"
              >
                Join Your Community <ArrowRight size={16} />
              </Link>
            )}
            <Link
              to="/learn"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
            >
              <BookOpen size={16} /> Read Solar Guides
            </Link>
          </div>
        </div>
      </section>

      {/* ── Upgraded Public Footer ───────────────────────────────────────── */}
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
      <Footer />
    </div>
  )
}

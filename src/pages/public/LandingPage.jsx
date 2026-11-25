/**
 * LandingPage.jsx — Sky-Inspired White & Blue Landing Page
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
          </div>
        </div>
      </nav>

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
          </div>
        </div>
      </section>

      {/* ── Key Metrics Bar ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-[#DCEBFA]">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-2xl sm:text-3xl font-black text-[#2563EB] tracking-tight">{s.value}</p>
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ─────────────────────────────────────────────── */}
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
                <f.icon size={22} className="text-[#0EA5E9]" />
              </div>
              <h3 className="font-bold text-[#153B65] text-base mb-1.5">{f.title}</h3>
              <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

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
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Ready to track your community's clean energy?
          </h2>
          <p className="text-[#DCEBFA] mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Join your residential neighborhood on SolarConnect today. Clean, transparent, and completely free.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm hover:bg-[#EAF6FF] transition-all shadow-lg hover:shadow-xl">
            Join Your Community <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}

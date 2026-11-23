/**
 * AboutPage.jsx — Educational Page About Solar Energy
 * Sky-Inspired White & Blue Design
 */
import { Link } from 'react-router-dom'
import { Sun, Zap, Leaf, ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import { useState } from 'react'
import Footer from '../../components/layout/Footer'

const faqs = [
  { q: 'How much can I save with solar panels?',
    a: 'A typical 3 kW system in India can save ₹20,000–₹30,000 per year depending on your electricity tariff and how much solar energy you use at home. The key metric is solar utilization — using as much generated solar as possible inside your home.' },
  { q: 'What factors affect solar generation?',
    a: 'The main factors are: sunlight hours (peak sun varies from 4–7 hours/day across India), panel orientation (south-facing is best), tilt angle (15–30°), panel cleanliness, shading from trees or buildings, and ambient temperature (high heat slightly reduces efficiency).' },
  { q: 'What happens on cloudy or rainy days?',
    a: 'Solar panels still generate electricity on cloudy days — typically 10–25% of their rated output. On rainy days, rain actually helps clean the panels. For grid-tied systems, you draw more from the grid on these days, which is why tracking your grid import is important.' },
  { q: 'How long do solar panels last?',
    a: 'Quality solar panels are warranted for 25 years and can last 30+ years. Output degrades by roughly 0.5% per year. After 25 years, most panels still produce about 87% of their original rated output.' },
  { q: 'What is the difference between solar generated and solar utilized?',
    a: 'Solar Generated is the total electricity your panels produced. Solar Utilized is the portion consumed inside your home. If you generate 20 kWh and export 5 kWh to the grid, your utilized figure is 15 kWh. Only the utilized portion reduces your electricity bill.' },
]

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#DCEBFA] last:border-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left gap-4"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-sm font-bold text-[#153B65]">{q}</span>
        <ChevronDown size={16} className={`text-[#64748B] shrink-0 transition-transform ${open ? 'rotate-180 text-[#2563EB]' : ''}`} />
      </button>
      {open && <p className="text-sm text-[#64748B] leading-relaxed pb-4 font-normal">{a}</p>}
    </div>
  )
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F4FAFF] text-[#153B65]">
      {/* Top Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-[#DCEBFA] px-6 h-16 flex items-center justify-between max-w-6xl mx-auto sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
            <Sun size={17} className="text-white" />
          </div>
          <span className="font-extrabold text-[#153B65] text-lg tracking-tight">SolarConnect</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm font-semibold text-[#153B65] hover:text-[#2563EB]">Sign In</Link>
          <Link to="/register" className="btn-primary text-xs sm:text-sm px-4 py-2">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-white via-[#F4FAFF] to-[#EAF6FF] border-b border-[#DCEBFA] py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mx-auto mb-5 text-[#0EA5E9] shadow-xs">
            <Sun size={30} className="stroke-[2.2]" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#153B65] mb-4 tracking-tight">
            Understanding Solar Energy
          </h1>
          <p className="text-[#64748B] text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Everything you need to know about how photovoltaic panels work, financial savings, and community impact.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-14 space-y-16">
        {/* What is solar */}
        <section>
          <h2 className="text-2xl font-black text-[#153B65] mb-4 tracking-tight">What is Solar Energy?</h2>
          <p className="text-[#64748B] leading-relaxed mb-4 text-sm sm:text-base">
            Solar energy is the light and heat radiated by the Sun. Photovoltaic (PV) cells capture photons from sunlight using semiconductor silicon wafers and generate direct electrical current (DC), which an inverter converts into alternating current (AC) for household appliances.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            {[
              { icon: Sun,  label: 'Sunlight Irradiance', desc: 'Solar photons strike silicon semiconductor cells' },
              { icon: Zap,  label: 'Clean Inversion', desc: 'DC electricity is inverted into clean AC home power' },
              { icon: Leaf, label: 'Zero Emissions', desc: 'Displaces coal-heavy grid electricity at 0.82 kg/kWh' },
            ].map((item) => (
              <div key={item.label} className="card text-center bg-white border border-[#DCEBFA]">
                <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mx-auto mb-3 text-[#0EA5E9]">
                  <item.icon size={20} />
                </div>
                <p className="font-bold text-[#153B65] text-sm">{item.label}</p>
                <p className="text-xs text-[#64748B] mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* System types */}
        <section>
          <h2 className="text-2xl font-black text-[#153B65] mb-4 tracking-tight">Types of Solar Systems</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: 'Grid-Tied', badge: 'Most Popular', color: 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]',
                pros: ['Lowest initial capital cost', 'Net metering feed-in credits', 'Zero expensive battery maintenance'],
                cons: ['Turns off during utility outages', 'Dependent on grid availability'] },
              { title: 'Off-Grid', badge: '100% Autonomy', color: 'bg-[#F4FAFF] text-[#0EA5E9] border border-[#DCEBFA]',
                pros: ['Complete utility independence', 'Operates in remote regions', 'Resilient against blackouts'],
                cons: ['High battery storage costs', 'Requires strict load management'] },
              { title: 'Hybrid', badge: 'Balanced Resilience', color: 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
                pros: ['Battery backup + grid feed-in', 'Flexible smart energy export', 'Continuity during power cuts'],
                cons: ['Higher upfront investment', 'More complex electrical layout'] },
            ].map((s) => (
              <div key={s.title} className="card bg-white border border-[#DCEBFA]">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-[#153B65] text-base">{s.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${s.color}`}>{s.badge}</span>
                </div>
                <p className="text-xs font-bold text-[#2563EB] mb-1">Key Advantages</p>
                <ul className="text-xs text-[#64748B] space-y-1 mb-4">
                  {s.pros.map((p) => (
                    <li key={p} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                      {p}
                    </li>
                  ))}
                </ul>
                <p className="text-xs font-bold text-[#64748B] mb-1">Considerations</p>
                <ul className="text-xs text-[#64748B] space-y-1">
                  {s.cons.map((c) => (
                    <li key={c} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <h2 className="text-2xl font-black text-[#153B65] mb-6 tracking-tight">Frequently Asked Questions</h2>
          <div className="card bg-white border border-[#DCEBFA] divide-y divide-[#DCEBFA]">
            {faqs.map((f) => <FAQ key={f.q} {...f} />)}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-[#153B65] to-[#2563EB] rounded-2xl p-8 sm:p-10 text-center text-white shadow-lg">
          <h2 className="text-2xl sm:text-3xl font-black mb-3 tracking-tight">Start Tracking Your Community's Solar Impact</h2>
          <p className="text-[#DCEBFA] mb-6 text-sm max-w-lg mx-auto leading-relaxed">
            Join your residential neighborhood on SolarConnect and watch your clean energy analytics come to life.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-[#2563EB] font-bold text-sm hover:bg-[#EAF6FF] transition-all shadow-md">
            Get Started Free <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      <Footer />
    </div>
  )
}

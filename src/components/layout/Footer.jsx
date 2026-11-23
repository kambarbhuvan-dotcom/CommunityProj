/**
 * Footer.jsx — Sky-Themed Public Page Footer (Navy Blue & White)
 * Provides comprehensive quick navigation, transparency disclosures,
 * and project context for community renewable energy tracking.
 */
import { Link } from 'react-router-dom'
import { Sun, ShieldCheck, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function Footer() {
  const { user, signOut, isAdmin } = useAuth()

  return (
    <footer className="bg-[#153B65] text-[#DCEBFA] border-t border-[#1E4E85]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand & Project Mission */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
                <Sun size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-base tracking-tight">SolarConnect</p>
                <p className="text-xs text-[#87CEEB]">Community Rooftop Solar Analytics • Hubballi</p>
              </div>
            </div>
            <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm">
              SolarConnect is an engineering initiative for community rooftop renewable energy tracking,
              transparent net-metering analytics, and environmental awareness.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1E4E85]/60 border border-[#2563EB]/40 text-[11px] text-[#87CEEB]">
              <ShieldCheck size={13} className="text-[#0EA5E9]" />
              <span>Standard CEA India 0.82 kg CO₂/kWh & HESCOM (Hubballi) baseline</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-[#DCEBFA]">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/log" className="hover:text-white transition-colors">Log Energy Usage</Link></li>
              <li><Link to="/records" className="hover:text-white transition-colors">My Records</Link></li>
              <li><Link to="/community" className="hover:text-white transition-colors">Community Stats</Link></li>
              <li><Link to="/learn" className="hover:text-white transition-colors">Learn Solar</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Solar</Link></li>
            </ul>
          </div>

          {/* Community & Portal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Community Portal</h4>
            <ul className="space-y-2 text-xs text-[#DCEBFA]">
              {user ? (
                <>
                  <li>
                    <Link
                      to={isAdmin ? '/admin' : '/dashboard'}
                      className="text-[#87CEEB] hover:text-white font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <span>My Dashboard</span>
                      <span>→</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={signOut}
                      className="hover:text-rose-300 transition-colors text-left flex items-center gap-1"
                    >
                      <LogOut size={12} />
                      <span>Sign Out</span>
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Join Community</Link></li>
                </>
              )}
              <li><Link to="/guides" className="hover:text-white transition-colors">Resident Guides</Link></li>
              <li><Link to="/announcements" className="hover:text-white transition-colors">Announcements</Link></li>
              <li><Link to="/achievements" className="hover:text-white transition-colors">Impact Badges</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#1E4E85] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94A3B8]">
          <p>© 2026 SolarConnect. Clean Energy & Sky-Inspired Community SaaS • Hubballi.</p>
          <p className="flex items-center gap-1.5 text-[11px]">
            Zero synthetic data • Physical energy balance verified
          </p>
        </div>
      </div>
    </footer>
  )
}

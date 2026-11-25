/**
 * Footer.jsx — Sky-Themed Public Page Footer (Navy Blue & White)
 */
import { Link } from 'react-router-dom'
import { Sun } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#153B65] text-[#DCEBFA]">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
              <Sun size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-base">SolarConnect</p>
              <p className="text-xs text-[#87CEEB]">Powering communities with clean energy</p>
            </div>
          </div>
          {/* Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            <Link to="/about" className="hover:text-white transition-colors">About Solar</Link>
            <Link to="/guides" className="hover:text-white transition-colors">Guides</Link>
            <Link to="/register" className="hover:text-white transition-colors">Join Community</Link>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#1E4E85] text-center text-xs text-[#94A3B8]">
          © 2026 SolarConnect. Clean Energy & Sky-Inspired Community SaaS.
        </div>
      </div>
    </footer>
  )
}

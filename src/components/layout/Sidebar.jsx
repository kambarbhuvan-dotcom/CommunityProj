/**
 * Sidebar.jsx — Sky-Inspired White & Blue Sidebar Navigation
 * Visual Identity:
 * - Pure White sidebar with Border Blue (#DCEBFA)
 * - Navy Blue (#153B65) typography
 * - Sky Blue (#87CEEB) & Deep Sky Blue (#0EA5E9) icons
 * - Active State: Pale Blue (#EAF6FF) with Primary Blue (#2563EB) text & accent
 */
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Zap, Users, BookOpen, Leaf, Settings,
  ShieldCheck, FileText, Building2, Bell, Trophy, Sun, Calendar,
  X, Sparkles
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const mainNav = [
  { to: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log',          icon: Zap,             label: 'Energy Tracking' },
  { to: '/records',      icon: FileText,        label: 'My Records' },
  { to: '/community',    icon: Users,           label: 'Community' },
  { to: '/guides',       icon: BookOpen,        label: 'Learn Solar' },
  { to: '/achievements', icon: Leaf,            label: 'Environmental Impact' },
]

const accountNav = [
  { to: '/announcements', icon: Bell,     label: 'Announcements' },
  { to: '/profile',       icon: Settings, label: 'Settings' },
]

const adminNav = [
  { to: '/admin',                 icon: ShieldCheck,  label: 'Admin Overview' },
  { to: '/admin/records',         icon: FileText,     label: 'All Records' },
  { to: '/admin/users',           icon: Users,        label: 'Manage Users' },
  { to: '/admin/events',          icon: Calendar,     label: 'Community Events' },
  { to: '/admin/guides',          icon: BookOpen,     label: 'Guides' },
  { to: '/admin/announcements',   icon: Bell,         label: 'Announcements' },
  { to: '/admin/buildings',       icon: Building2,    label: 'Buildings' },
  { to: '/admin/achievements',    icon: Trophy,       label: 'Achievements' },
]

function NavItem({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
          isActive
            ? 'bg-[#EAF6FF] text-[#2563EB] font-bold shadow-xs'
            : 'text-[#153B65] hover:bg-[#EAF6FF]/60 hover:text-[#2563EB]'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#2563EB]" />
          )}
          <Icon
            size={18}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-[#2563EB] stroke-[2.3]' : 'text-[#0EA5E9] group-hover:text-[#2563EB]'
            }`}
          />
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="px-3.5 pt-4 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
      {children}
    </p>
  )
}

export default function Sidebar({ onClose }) {
  const { isAdmin, switchDemoRole } = useAuth()

  return (
    <aside className="flex flex-col h-full bg-white border-r border-[#DCEBFA] w-64 shrink-0 select-none shadow-sidebar">
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#DCEBFA]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
            <Sun size={19} className="text-white stroke-[2.2]" />
          </div>
          <div>
            <span className="text-base font-extrabold text-[#153B65] tracking-tight block leading-tight">
              SolarConnect
            </span>
            <span className="text-[10px] text-[#0EA5E9] font-bold tracking-wide uppercase">
              Sky Clean Energy
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#153B65] hover:bg-[#EAF6FF] transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        <SectionLabel>Core Portal</SectionLabel>
        {mainNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}

        <SectionLabel>Account & Community</SectionLabel>
        {accountNav.map((item) => (
          <NavItem key={item.to} {...item} onClick={onClose} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-2">
              <SectionLabel>Admin Console</SectionLabel>
            </div>
            {adminNav.map((item) => (
              <NavItem key={item.to} {...item} onClick={onClose} />
            ))}
          </>
        )}
      </nav>

      {/* Security Role Switcher & System Status Footer */}
      <div className="p-3.5 border-t border-[#DCEBFA] bg-[#F4FAFF] space-y-2.5">
        <div className="flex items-center justify-between text-xs bg-white border border-[#DCEBFA] p-2 rounded-xl shadow-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles size={13} className="text-[#0EA5E9]" />
            <span className="text-[11px] font-semibold text-[#153B65]">Mode:</span>
          </div>
          <button
            onClick={() => switchDemoRole(isAdmin ? 'resident' : 'admin')}
            className={`px-2 py-0.5 rounded-lg font-bold text-[10px] tracking-wide uppercase transition-all shadow-xs ${
              isAdmin
                ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                : 'bg-[#153B65] text-white hover:bg-[#0F2B48]'
            }`}
            title="Toggle between Admin and Resident role to test permission gates"
          >
            {isAdmin ? 'ADMIN' : 'RESIDENT'}
          </button>
        </div>
        <p className="text-[10px] text-[#64748B] text-center font-medium">
          SolarConnect v2.0 • Sky Blue Edition
        </p>
      </div>
    </aside>
  )
}

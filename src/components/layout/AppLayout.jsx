/**
 * AppLayout.jsx
 * Sky-Inspired White and Blue Layout
 * Main layout: Sidebar (desktop) + Topbar + Content Viewport.
 * Features:
 * - Ice Blue (#F4FAFF) page background
 * - Mobile slide drawer with backdrop blur
 * - Mobile bottom quick-action navigation bar in White & Pale Blue
 * - Accessible skip-to-content link
 */
import { useState, useEffect } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import { LayoutDashboard, Zap, FileText, BookOpen, Users } from 'lucide-react'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const mobileBottomNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/log',       icon: Zap,             label: 'Log Energy' },
  { to: '/records',   icon: FileText,        label: 'Records' },
  { to: '/guides',    icon: BookOpen,        label: 'Learn' },
  { to: '/community', icon: Users,           label: 'Community' },
]

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-[#F4FAFF] text-[#153B65]">
      {/* Accessible Skip to Content */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#2563EB] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#87CEEB] text-xs font-semibold"
      >
        Skip to main content
      </a>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay with smooth drawer animation */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ${
          sidebarOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-[#153B65]/40 backdrop-blur-xs transition-opacity duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Drawer panel */}
        <div
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] transform transition-transform duration-300 ease-out shadow-2xl ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />

        <main id="main-content" className="flex-1 overflow-y-auto outline-none pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </div>
        </main>

        {/* Mobile bottom quick navigation bar */}
        <nav
          aria-label="Mobile quick navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#DCEBFA] px-2 py-1.5 flex items-center justify-around shadow-lg"
        >
          {mobileBottomNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all ${
                  isActive
                    ? 'text-[#2563EB] bg-[#EAF6FF] font-bold scale-105'
                    : 'text-[#64748B] hover:text-[#153B65] hover:bg-[#F4FAFF]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={19}
                    className={`transition-colors ${
                      isActive ? 'text-[#2563EB] stroke-[2.3]' : 'text-[#0EA5E9]'
                    }`}
                  />
                  <span className="mt-0.5">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

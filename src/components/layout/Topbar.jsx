/**
 * Topbar.jsx — Sky-Inspired White & Blue Topbar
 * Shows: responsive menu toggle, global quick search, announcements bell, and user avatar dropdown
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
<<<<<<< HEAD
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings, Sun, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'

export default function Topbar({ onMenuClick }) {
  const { profile, isAdmin, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
=======
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings, Sun, Sparkles, RotateCcw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'
import { resetAllDemoData } from '../../services/solarDataService'

export default function Topbar({ onMenuClick }) {
  const { user, profile, isAdmin, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [resetting, setResetting] = useState(false)
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

<<<<<<< HEAD
=======
  async function handleResetDemoData() {
    if (window.confirm('Reset all demo energy logs, records, and configuration to an empty slate for judge presentation?')) {
      setResetting(true)
      try {
        await resetAllDemoData(user?.id)
        window.location.reload()
      } catch (err) {
        console.error('Reset error:', err)
      } finally {
        setResetting(false)
      }
    }
  }

>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
  function handleSearchSubmit(e) {
    if (e.key === 'Enter' && searchValue.trim()) {
      navigate(`/records?q=${encodeURIComponent(searchValue.trim())}`)
    }
  }

  return (
    <header className="h-16 bg-white/95 backdrop-blur-md border-b border-[#DCEBFA] flex items-center px-4 sm:px-6 gap-3 shrink-0 z-30 select-none shadow-xs">
      {/* Mobile menu trigger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-[#EAF6FF] text-[#153B65] hover:text-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
        aria-label="Open sidebar menu"
      >
        <Menu size={20} className="stroke-[2.2]" />
      </button>

      {/* Mobile brand mark */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
          <Sun size={16} className="text-white" />
        </div>
        <span className="font-extrabold text-[#153B65] text-sm tracking-tight">
          SolarConnect
        </span>
      </div>

      {/* Global Quick Search */}
      <div className="hidden md:flex flex-1 max-w-sm relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none"
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleSearchSubmit}
          placeholder="Search records, guides, buildings... (Press Enter)"
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-[#DCEBFA] text-xs sm:text-sm text-[#153B65] placeholder-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-[#2563EB] transition-all shadow-xs"
        />
      </div>

      <div className="flex-1" />

<<<<<<< HEAD
=======
      {/* Quick Reset Demo Data Button for Presentations */}
      <button
        onClick={handleResetDemoData}
        disabled={resetting}
        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors shadow-xs"
        title="Wipe demo records and reset configuration to a clean slate for judges"
      >
        <RotateCcw size={13} className={`text-rose-600 ${resetting ? 'animate-spin' : ''}`} />
        <span>{resetting ? 'Resetting...' : 'Reset Demo Data'}</span>
      </button>

>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
      {/* Announcements Notification Bell */}
      <button
        className="relative p-2.5 rounded-xl hover:bg-[#EAF6FF] text-[#64748B] hover:text-[#2563EB] transition-colors focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
        aria-label="Community Announcements"
        onClick={() => navigate('/announcements')}
        title="View Community Announcements"
      >
        <Bell size={18} className="stroke-[2]" />
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#0EA5E9] border-2 border-white ring-1 ring-[#0EA5E9]/50 animate-pulse" />
      </button>

      {/* User profile dropdown */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-[#EAF6FF]/80 border border-transparent hover:border-[#DCEBFA] transition-all focus:outline-none focus:ring-2 focus:ring-[#87CEEB]"
          aria-expanded={dropdownOpen}
          aria-haspopup="true"
        >
          {/* Avatar with initials */}
          <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-xs font-bold text-[#2563EB] shadow-xs">
            {getInitials(profile?.full_name || 'Resident')}
          </div>

          <div className="hidden sm:flex flex-col items-start leading-none text-left">
            <span className="text-xs font-bold text-[#153B65] max-w-[120px] truncate">
              {profile?.full_name || 'Resident'}
            </span>
            <span className="text-[10px] text-[#64748B] mt-0.5 font-medium">
              {isAdmin ? 'System Admin' : 'Resident Portal'}
            </span>
          </div>

          {isAdmin && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-[#2563EB] text-white px-1.5 py-0.5 rounded-md tracking-wider">
              ADMIN
            </span>
          )}

          <ChevronDown
            size={14}
            className={`text-[#64748B] transition-transform duration-200 ${
              dropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-[#DCEBFA] py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-4 py-3 border-b border-[#DCEBFA]">
                <p className="text-xs font-bold text-[#153B65] truncate">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                  {profile?.email || 'user@solarconnect.internal'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#EAF6FF] border border-[#DCEBFA] text-[10px] font-semibold text-[#2563EB]">
                  <Sparkles size={11} className="text-[#0EA5E9]" />
                  Unit: {profile?.unit_number || 'A-402'}
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigate('/profile')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#153B65] hover:text-[#2563EB] hover:bg-[#EAF6FF] transition-colors"
                >
                  <User size={15} className="text-[#64748B]" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setDropdownOpen(false)
                    navigate('/profile')
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#153B65] hover:text-[#2563EB] hover:bg-[#EAF6FF] transition-colors"
                >
                  <Settings size={15} className="text-[#64748B]" />
                  Account Settings
                </button>
              </div>

              <div className="border-t border-[#DCEBFA] my-1" />

              <div className="py-0.5">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={15} />
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}

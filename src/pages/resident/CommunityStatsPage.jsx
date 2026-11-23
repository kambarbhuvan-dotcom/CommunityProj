/**
 * CommunityStatsPage.jsx — SolarConnect Community Module
 *
 * Implements:
 * 1. Community Overview:
 *    - Total participating households
 *    - Total solar energy generated (kWh / MWh)
 *    - Total solar energy utilized (kWh)
 *    - Total estimated environmental impact (CO2 tonnes avoided, trees equivalent)
 * 2. Community Leaderboard:
 *    - Rank participating buildings or anonymized households
 *    - Compare solar energy generation & self-sufficiency
 *    - Toggle between Building view and Anonymized Unit view
 * 3. Community Announcements:
 *    - Solar awareness campaigns
 *    - Solar installation workshops
 *    - Energy conservation activities
 *    - Community achievements
 * 4. Participation Module:
 *    - Interactive event registration ("Register Interest" toggle with counter)
 *    - Completed community activities and outcomes
 * 5. Achievement Badges:
 *    - Solar Starter
 *    - Energy Saver
 *    - Green Community Champion
 * 6. Privacy Protection:
 *    - Aggregated statistics only; no private individual household consumption exposed.
 */

import { useState, useEffect } from 'react'
import {
  Users, Sun, Zap, Leaf, Trophy, Calendar, Bell, ShieldCheck,
  CheckCircle2, ArrowRight, Award, Megaphone, Wrench, Sparkles,
  Layers, Lock, Check, Clock, MapPin, UserCheck, ChevronRight,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Toast from '../../components/ui/Toast'
import {
  COMMUNITY_OVERVIEW, BUILDING_LEADERBOARD, ANONYMOUS_UNIT_LEADERBOARD,
  COMMUNITY_ANNOUNCEMENTS, COMMUNITY_EVENTS, COMPLETED_ACTIVITIES,
  ACHIEVEMENT_BADGES,
} from '../../data/communityData'
import { formatDate } from '../../utils/formatters'

export default function CommunityStatsPage() {
  const [leaderboardView, setLeaderboardView] = useState('building') // 'building' | 'units'
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'leaderboard' | 'announcements' | 'events' | 'badges'

  // Interactive event registrations stored in localStorage
  const [registeredEvents, setRegisteredEvents] = useState(() => {
    try {
      const saved = localStorage.getItem('solarconnect_registered_events')
      return saved ? JSON.parse(saved) : ['evt-1'] // Pre-register in 1 for demo
    } catch {
      return ['evt-1']
    }
  })

  const [toastMessage, setToastMessage] = useState(null)

  const toggleEventRegistration = (eventId, eventTitle) => {
    setRegisteredEvents((prev) => {
      let updated
      const isCurrentlyRegistered = prev.includes(eventId)
      if (isCurrentlyRegistered) {
        updated = prev.filter((id) => id !== eventId)
        showToast(`Cancelled registration for "${eventTitle}".`)
      } else {
        updated = [...prev, eventId]
        showToast(`Successfully registered interest for "${eventTitle}"!`)
      }
      try {
        localStorage.setItem('solarconnect_registered_events', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage((curr) => (curr === msg ? null : curr))
    }, 4000)
  }

  return (
    <AppLayout>
      <PageWrapper
        title="Community Solar Hub"
        subtitle="Uniting residential households to accelerate solar energy adoption, collective savings, and ecological impact."
        actions={
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#DCEBFA] shadow-sm text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'all' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'leaderboard' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'announcements' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
              }`}
            >
              Announcements
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'events' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab('badges')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'badges' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
              }`}
            >
              Badges
            </button>
          </div>
        }
      >
        {/* Toast alert */}
        {toastMessage && (
          <Toast
            message={toastMessage}
            type="success"
            title="Community Update"
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* ── Privacy Assurance Banner ───────────────────────────────────── */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#EAF6FF] border border-[#DCEBFA] mb-6 text-xs text-[#153B65]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-[#2563EB] shrink-0" />
            <span>
              <strong>Privacy-First Community:</strong> Individual household electricity meter readings are kept confidential.
              All leaderboards display building aggregates or anonymized unit codes.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] bg-white px-2.5 py-0.5 rounded-full border border-[#DCEBFA] shrink-0 hidden sm:inline">
            Aggregated Data
          </span>
        </div>

        {/* ── 1. Community Overview Section ──────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'leaderboard') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading text-base flex items-center gap-2">
                <Users size={18} className="text-forest" />
                Community Overview
              </h2>
              <span className="text-xs text-charcoal-300 font-medium">Updated today</span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <StatCard
                title="Participating Households"
                value={`${COMMUNITY_OVERVIEW.activeGeneratingHouseholds} / ${COMMUNITY_OVERVIEW.totalHouseholds}`}
                icon={Users}
                color="blue"
                subtitle="75% adoption rate"
                isDemo
              />
              <StatCard
                title="Total Solar Generated"
                value={(COMMUNITY_OVERVIEW.totalGeneratedKwh / 1000).toFixed(1)}
                unit="MWh"
                icon={Sun}
                color="green"
                subtitle={`${COMMUNITY_OVERVIEW.totalGeneratedKwh.toLocaleString()} kWh all-time`}
                isDemo
              />
              <StatCard
                title="Total Solar Utilized"
                value={(COMMUNITY_OVERVIEW.totalUtilizedKwh / 1000).toFixed(1)}
                unit="MWh"
                icon={Zap}
                color="green"
                subtitle="In-home clean power consumed"
                isDemo
              />
              <StatCard
                title="Est. Environmental Impact"
                value={(COMMUNITY_OVERVIEW.totalCO2AvoidedKg / 1000).toFixed(2)}
                unit="tonnes CO₂"
                icon={Leaf}
                color="green"
                subtitle={`Equivalent to ${COMMUNITY_OVERVIEW.totalTreesEquivalent} mature trees`}
                isDemo
              />
            </div>

            {/* Monthly Target Progress Bar */}
            <div className="bg-white rounded-2xl shadow-card p-4 border border-[#DCEBFA]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-[#153B65]">
                  Monthly Community Target: {COMMUNITY_OVERVIEW.currentMonthTargetKwh.toLocaleString()} kWh
                </span>
                <span className="text-[#2563EB] font-bold">
                  {COMMUNITY_OVERVIEW.currentMonthProgressKwh.toLocaleString()} kWh (
                  {Math.round((COMMUNITY_OVERVIEW.currentMonthProgressKwh / COMMUNITY_OVERVIEW.currentMonthTargetKwh) * 100)}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#F4FAFF] rounded-full overflow-hidden border border-[#DCEBFA]">
                <div
                  className="h-full bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (COMMUNITY_OVERVIEW.currentMonthProgressKwh / COMMUNITY_OVERVIEW.currentMonthTargetKwh) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── 2. Community Leaderboard ────────────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'leaderboard') && (
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-[#0EA5E9]" />
                <h3 className="section-heading text-base text-[#153B65]">Community Solar Leaderboard</h3>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#DCEBFA] text-xs">
                <button
                  onClick={() => setLeaderboardView('building')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    leaderboardView === 'building' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
                  }`}
                >
                  By Building / Block
                </button>
                <button
                  onClick={() => setLeaderboardView('units')}
                  className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                    leaderboardView === 'units' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-[#64748B] hover:text-[#2563EB]'
                  }`}
                >
                  By Anonymized Unit
                </button>
              </div>
            </div>

            {leaderboardView === 'building' ? (
              /* Building View Table */
              <Card className="p-0 overflow-hidden border border-[#DCEBFA]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA]">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Rank</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Building / Block</th>
                        <th className="px-4 py-3.5 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wide">Participating Units</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Installed Capacity</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">This Month Gen</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Self-Sufficiency</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">CO₂ Offset</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBFA]">
                      {BUILDING_LEADERBOARD.map((b) => (
                        <tr key={b.rank} className="hover:bg-[#F4FAFF] transition-colors">
                          <td className="px-4 py-3 font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                b.rank === 1
                                  ? 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] shadow-xs'
                                  : b.rank === 2
                                  ? 'bg-[#F4FAFF] text-[#0EA5E9] border border-[#DCEBFA]'
                                  : b.rank === 3
                                  ? 'bg-[#F4FAFF] text-[#87CEEB] border border-[#DCEBFA]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              #{b.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#153B65]">
                            {b.name}
                            <span className="block text-[11px] font-medium text-[#0EA5E9]">{b.badge}</span>
                          </td>
                          <td className="px-4 py-3 text-center text-[#64748B] font-medium">
                            {b.households} flats
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B] font-medium">
                            {b.installedCapacityKw} kW
                          </td>
                          <td className="px-4 py-3 text-right text-[#2563EB] font-bold">
                            {b.monthGenKwh.toLocaleString()} kWh
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#153B65]">
                            {b.selfSufficiency}%
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B]">
                            {b.co2AvoidedKg.toLocaleString()} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              /* Anonymized Unit View Table */
              <Card className="p-0 overflow-hidden border border-[#DCEBFA]">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA]">
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Rank</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Anonymized Unit ID</th>
                        <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Block</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Monthly Gen</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Solar Utilized</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Self-Sufficiency</th>
                        <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">CO₂ Avoided</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBFA]">
                      {ANONYMOUS_UNIT_LEADERBOARD.map((u) => (
                        <tr key={u.rank} className="hover:bg-[#F4FAFF] transition-colors">
                          <td className="px-4 py-3 font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                                u.rank === 1
                                  ? 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] shadow-xs'
                                  : u.rank === 2
                                  ? 'bg-[#F4FAFF] text-[#0EA5E9] border border-[#DCEBFA]'
                                  : u.rank === 3
                                  ? 'bg-[#F4FAFF] text-[#87CEEB] border border-[#DCEBFA]'
                                  : 'text-[#64748B]'
                              }`}
                            >
                              #{u.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#153B65] flex items-center gap-1.5">
                            <Lock size={12} className="text-[#64748B]" />
                            {u.unitCode}
                          </td>
                          <td className="px-4 py-3 text-[#64748B] font-medium">
                            {u.building}
                          </td>
                          <td className="px-4 py-3 text-right text-[#2563EB] font-bold">
                            {u.genKwh} kWh
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B] font-medium">
                            {u.utiKwh} kWh
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-[#153B65]">
                            {u.selfSufficiency}%
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B]">
                            {u.co2Kg} kg
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* ── 3. Community Announcements Section ─────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'announcements') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading text-base flex items-center gap-2 text-[#153B65]">
                <Megaphone size={18} className="text-[#2563EB]" />
                Community Announcements & Campaigns
              </h2>
              <span className="text-xs text-[#64748B]">Notices from Project Admins</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMMUNITY_ANNOUNCEMENTS.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] hover:shadow-card-hover hover:border-[#87CEEB] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          ann.type === 'campaign'
                            ? 'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]'
                            : ann.type === 'workshop'
                            ? 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]'
                            : ann.type === 'conservation'
                            ? 'bg-[#F0FDF4] text-[#22C55E] border border-[#DCFCE7]'
                            : 'bg-[#F4FAFF] text-[#153B65] border border-[#DCEBFA]'
                        }`}
                      >
                        {ann.category}
                      </span>
                      <span className="text-xs text-[#64748B]">{formatDate(ann.date)}</span>
                    </div>

                    <h4 className="font-bold text-[#153B65] text-sm mb-1.5">{ann.title}</h4>
                    <p className="text-xs text-[#64748B] leading-relaxed mb-3">{ann.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-[#DCEBFA] flex items-center justify-between text-xs font-semibold text-[#2563EB]">
                    <span>{ann.highlight}</span>
                    <Sparkles size={13} className="text-[#0EA5E9]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. Participation: Upcoming Events & Completed Activities ──── */}
        {(activeTab === 'all' || activeTab === 'events') && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading text-base flex items-center gap-2 text-[#153B65]">
                <Calendar size={18} className="text-[#2563EB]" />
                Community Participation & Workshops
              </h2>
              <span className="text-xs text-[#64748B] font-medium">Join upcoming solar activities</span>
            </div>

            {/* Upcoming Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {COMMUNITY_EVENTS.map((evt) => {
                const isRegistered = registeredEvents.includes(evt.id)
                const currentAttendees = evt.registeredCount + (isRegistered ? 1 : 0)

                return (
                  <div
                    key={evt.id}
                    className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA] hover:shadow-card-hover hover:border-[#87CEEB] transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[10px] font-bold text-[#2563EB] bg-[#EAF6FF] px-2 py-0.5 rounded-full border border-[#DCEBFA]">
                          {evt.category}
                        </span>
                        <span className="text-[11px] text-[#64748B] font-medium flex items-center gap-1">
                          <UserCheck size={12} /> {currentAttendees} / {evt.capacity} spots
                        </span>
                      </div>

                      <h4 className="font-bold text-[#153B65] text-sm mb-2">{evt.title}</h4>
                      <p className="text-xs text-[#64748B] leading-relaxed mb-4">{evt.description}</p>

                      <div className="space-y-1.5 text-xs text-[#64748B] bg-[#F4FAFF] p-2.5 rounded-xl border border-[#DCEBFA] mb-4">
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-[#2563EB] shrink-0" />
                          <span>
                            {evt.date} • {evt.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin size={12} className="text-[#2563EB] shrink-0" />
                          <span>{evt.location}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleEventRegistration(evt.id, evt.title)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm ${
                        isRegistered
                          ? 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] hover:bg-[#DCEBFA]'
                          : 'bg-[#2563EB] text-white hover:bg-[#1D4ED8]'
                      }`}
                    >
                      {isRegistered ? (
                        <>
                          <Check size={14} /> Registered (Click to cancel)
                        </>
                      ) : (
                        <>
                          <UserCheck size={14} /> Register Interest
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Completed Activities Showcase */}
            <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3 flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#22C55E]" />
                Completed Community Activities & Outcomes
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {COMPLETED_ACTIVITIES.map((comp) => (
                  <div key={comp.id} className="bg-[#F4FAFF] p-3.5 rounded-xl border border-[#DCEBFA]">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] mb-1">
                      <span>{comp.date}</span>
                      <span className="font-semibold text-[#2563EB]">{comp.participants} participants</span>
                    </div>
                    <h5 className="font-bold text-[#153B65] text-xs mb-1">{comp.title}</h5>
                    <p className="text-[11px] text-[#64748B] leading-relaxed">{comp.outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── 5. Achievement Badges ───────────────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'badges') && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-heading text-base flex items-center gap-2 text-[#153B65]">
                <Award size={18} className="text-[#0EA5E9]" />
                Community Achievement Badges
              </h2>
              <span className="text-xs text-[#64748B]">Earn badges through clean solar participation</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {ACHIEVEMENT_BADGES.map((b) => (
                <div
                  key={b.id}
                  className={`bg-white rounded-2xl shadow-card p-5 border transition-all ${
                    b.unlocked
                      ? 'border-[#2563EB] ring-2 ring-[#2563EB]/15 hover:shadow-card-hover'
                      : 'border-[#DCEBFA] opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center border border-[#DCEBFA] ${
                        b.id === 'badge-1'
                          ? 'bg-[#EAF6FF] text-[#0EA5E9]'
                          : b.id === 'badge-2'
                          ? 'bg-[#EAF6FF] text-[#2563EB]'
                          : 'bg-[#EAF6FF] text-[#0284C7]'
                      }`}
                    >
                      {b.id === 'badge-1' && <Sun size={24} />}
                      {b.id === 'badge-2' && <Zap size={24} />}
                      {b.id === 'badge-3' && <Trophy size={24} />}
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        b.unlocked
                          ? 'bg-[#F0FDF4] text-[#22C55E] border border-[#DCFCE7]'
                          : 'bg-[#F4FAFF] text-[#64748B] border border-[#DCEBFA]'
                      }`}
                    >
                      {b.unlocked ? '✓ Unlocked' : 'In Progress'}
                    </span>
                  </div>

                  <h3 className="font-bold text-[#153B65] text-sm mb-1">{b.name}</h3>
                  <p className="text-xs text-[#64748B] mb-3 leading-relaxed">{b.description}</p>

                  <div className="pt-3 border-t border-[#DCEBFA] text-xs">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#64748B] font-medium">Requirement:</span>
                      <span className="font-bold text-[#153B65]">{b.criteriaProgress}</span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">{b.requirement}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageWrapper>
    </AppLayout>
  )
}

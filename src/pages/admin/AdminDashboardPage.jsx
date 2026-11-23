/**
 * AdminDashboardPage.jsx — Admin Overview Dashboard
 *
 * Implements:
 * 1. Live community aggregate metrics:
 *    - Total registered users
 *    - Total participating buildings
 *    - Total energy records
 *    - Community solar generation (kWh)
 *    - Solar electricity utilized (kWh)
 *    - Active community workshops & campaigns
 * 2. Quick administrative actions (jump to manage users, records, guides, announcements, events)
 * 3. Recent energy logs stream with quick status
 * 4. System activity and community health audit trail
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, FileText, Sun, Leaf, DollarSign, BookOpen, ShieldCheck,
  Building2, Calendar, Bell, ArrowRight, CheckCircle2, TrendingUp,
  AlertCircle, Sparkles, Activity, Clock
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import StatCard from '../../components/ui/StatCard'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import { SkeletonStatCard } from '../../components/ui/Skeleton'
import { getAdminDashboardOverview } from '../../services/adminService'
import { formatDate } from '../../utils/formatters'
import { calcCostSaved, calcCO2Avoided, calcNetEnergy } from '../../utils/calculations'

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminDashboardOverview()
        setMetrics(data)
      } catch (err) {
        console.error('Failed to load admin overview:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const savedRs = metrics ? calcCostSaved(metrics.totalSolarUtilKwh) : 0
  const avoidedCO2 = metrics ? calcCO2Avoided(metrics.totalSolarGenKwh) : 0

  return (
    <AppLayout>
      <PageWrapper
        title="Admin Control Center"
        subtitle="Community-wide solar management, resident accounts, and governance."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> SECURE ADMIN MODE</Badge>
          </div>
        }
      >
        {/* Security Banner */}
        <div className="flex items-start sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] mb-6 text-xs text-[#153B65]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={16} />
            </div>
            <div>
              <p className="font-semibold text-[#153B65]">Database-Level Role Enforcement Active</p>
              <p className="text-[#64748B] text-[11px] mt-0.5">
                Administrative queries are gated via Supabase Row-Level Security (RLS). Resident users cannot elevate their own role or tamper with other units.
              </p>
            </div>
          </div>
          <span className="hidden md:inline-block px-2.5 py-1 rounded-md bg-white border border-[#DCEBFA] font-mono text-[10px] text-[#2563EB] font-bold shrink-0">
            RLS: ENFORCED
          </span>
        </div>

        {/* 1. Core KPIs from Prompt */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Registered Residents"
              value={metrics ? metrics.totalUsers : '—'}
              subtitle={`${metrics?.adminUsers || 0} Admins • ${metrics?.activeUsers || 0} Active`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Participating Buildings"
              value={metrics ? metrics.totalBuildings : '—'}
              subtitle="Grouping 48+ total units"
              icon={Building2}
              color="sky"
            />
            <StatCard
              title="Total Energy Records"
              value={metrics ? metrics.totalRecords : '—'}
              subtitle="Verified community logs"
              icon={FileText}
              color="blue"
            />
            <StatCard
              title="Community Solar Gen"
              value={metrics ? metrics.totalSolarGenKwh.toLocaleString() : '—'}
              unit="kWh"
              subtitle={`${avoidedCO2.toFixed(0)} kg CO₂ avoided`}
              icon={Sun}
              color="sky"
            />
          </div>
        )}

        {/* Secondary Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 flex items-center justify-between border border-[#DCEBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center">
                <Leaf size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Clean Energy Utilized</p>
                <p className="text-base font-bold text-[#153B65]">
                  {metrics ? `${metrics.totalSolarUtilKwh.toLocaleString()} kWh` : '—'}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#2563EB] bg-[#EAF6FF] px-2 py-0.5 rounded-md border border-[#DCEBFA]">
              {metrics?.totalSolarGenKwh
                ? `${Math.round((metrics.totalSolarUtilKwh / metrics.totalSolarGenKwh) * 100)}% self-used`
                : '—'}
            </span>
          </Card>

          <Card className="p-4 flex items-center justify-between border border-[#DCEBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center">
                <DollarSign size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Community Bill Savings</p>
                <p className="text-base font-bold text-[#153B65]">
                  ₹{savedRs.toLocaleString()}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-[#64748B]">@ ₹7.50 / kWh</span>
          </Card>

          <Card className="p-4 flex items-center justify-between border border-[#DCEBFA]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] text-[#0284C7] border border-[#DCEBFA] flex items-center justify-center">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-xs text-[#64748B]">Active Workshops</p>
                <p className="text-base font-bold text-[#153B65]">
                  {metrics ? metrics.activeWorkshops : '—'} Scheduled
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#0284C7] bg-[#EAF6FF] px-2 py-0.5 rounded-md border border-[#DCEBFA]">
              {metrics?.totalRegistrations || 0} RSVPs
            </span>
          </Card>
        </div>

        {/* 2. Quick Administrative Navigation Cards */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-heading text-[#153B65]">Administrative Modules</h3>
            <span className="text-xs text-[#64748B]">Direct portal management shortcuts</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <Users size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                User Management
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                View residents, manage unit roles, assign admin privileges, and control account status.
              </p>
            </Link>

            <Link
              to="/admin/records"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <FileText size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                Energy Records
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Audit, filter by building, modify or delete incorrect solar and grid consumption records.
              </p>
            </Link>

            <Link
              to="/admin/events"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors">
                  <Calendar size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                Community Events & Workshops
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Add solar clinics, edit venue and timing details, and inspect resident RSVPs and attendance.
              </p>
            </Link>

            <Link
              to="/admin/guides"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <BookOpen size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                Educational Content
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Author new solar articles, update government scheme guides, and toggle published status.
              </p>
            </Link>

            <Link
              to="/admin/announcements"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#0EA5E9] group-hover:text-white transition-colors">
                  <Bell size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#0EA5E9] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                Announcements
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Broadcast clean energy campaigns, seasonal panel cleaning drives, and milestone notices.
              </p>
            </Link>

            <Link
              to="/admin/buildings"
              className="p-4 bg-white rounded-2xl border border-[#DCEBFA] hover:border-[#87CEEB] hover:shadow-card-hover transition-all group block"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#EAF6FF] text-[#0284C7] border border-[#DCEBFA] flex items-center justify-center group-hover:bg-[#0284C7] group-hover:text-white transition-colors">
                  <Building2 size={18} />
                </div>
                <ArrowRight size={15} className="text-[#64748B] group-hover:text-[#0284C7] group-hover:translate-x-0.5 transition-all" />
              </div>
              <h4 className="font-semibold text-[#153B65] text-sm group-hover:text-[#2563EB] transition-colors">
                Buildings & Infrastructure
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                Configure apartment blocks, rooftop surface capacities, and aggregate grouping rules.
              </p>
            </Link>
          </div>
        </div>

        {/* 3. Recent Energy Records & Community Log */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-0 overflow-hidden lg:col-span-2 border border-[#DCEBFA]">
            <div className="px-5 py-4 border-b border-[#DCEBFA] flex items-center justify-between">
              <div>
                <h3 className="section-heading text-[#153B65]">Recent Energy Log Records</h3>
                <p className="text-xs text-[#64748B]">Live entries recorded across participating buildings</p>
              </div>
              <Link to="/admin/records" className="text-xs font-semibold text-[#2563EB] hover:underline">
                View All &rarr;
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA] text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Building / Unit</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Date</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Generated</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Consumed</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Net Balance</th>
                    <th className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase">Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCEBFA]">
                  {metrics?.recentRecords?.map((log) => {
                    const net = calcNetEnergy(log.solar_generated_kwh, log.consumption_kwh)
                    return (
                      <tr key={log.id} className="hover:bg-[#F4FAFF] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#153B65]">
                          {log.building || 'Community Unit'}
                        </td>
                        <td className="px-4 py-3 text-[#64748B] text-xs whitespace-nowrap">
                          {formatDate(log.log_date)}
                        </td>
                        <td className="px-4 py-3 text-[#2563EB] font-semibold text-xs">
                          {log.solar_generated_kwh} kWh
                        </td>
                        <td className="px-4 py-3 text-[#153B65] text-xs">
                          {log.consumption_kwh} kWh
                        </td>
                        <td className="px-4 py-3 text-xs font-medium">
                          <span className={net >= 0 ? 'text-[#22C55E]' : 'text-red-500'}>
                            {net >= 0 ? `+${net.toFixed(1)}` : net.toFixed(1)} kWh
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.is_demo ? (
                            <Badge variant="demo">DEMO</Badge>
                          ) : (
                            <Badge variant="success">LIVE</Badge>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Activity / Governance Feed */}
          <Card className="p-5 border border-[#DCEBFA]">
            <h3 className="section-heading text-[#153B65] mb-1">Administrative Activity</h3>
            <p className="text-xs text-[#64748B] mb-4">Security and configuration trail</p>

            <div className="space-y-4">
              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EAF6FF] text-[#22C55E] border border-[#DCEBFA] flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#153B65]">Anti-Self-Demotion Verified</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Admin user cannot revoke their own rights, preventing accidental account lockouts.
                  </p>
                  <span className="text-[10px] text-[#2563EB] mt-1 block font-medium">Rule Active</span>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#153B65]">Workshop RSVPs Updated</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    {metrics?.totalRegistrations || 0} residents confirmed interest across {metrics?.activeWorkshops || 0} upcoming sessions.
                  </p>
                  <span className="text-[10px] text-[#2563EB] mt-1 block font-medium">Live Count</span>
                </div>
              </div>

              <div className="flex gap-3 text-xs">
                <div className="w-7 h-7 rounded-lg bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA] flex items-center justify-center shrink-0 mt-0.5">
                  <Sun size={14} />
                </div>
                <div>
                  <p className="font-semibold text-[#153B65]">Aggregated Privacy Shield</p>
                  <p className="text-[#64748B] text-[11px] mt-0.5">
                    Community public leaderboard displays building totals only; individual unit consumption remains strictly private.
                  </p>
                  <span className="text-[10px] text-[#2563EB] mt-1 block font-medium">Privacy Guard</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </PageWrapper>
    </AppLayout>
  )
}

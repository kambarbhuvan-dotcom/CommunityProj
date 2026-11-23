/**
 * MyRecordsPage.jsx — Personal Energy Log History & Management
 *
 * Implements:
 * 1. Filterable & Paginated Table of personal real energy records:
 *    - Date
 *    - Solar Generated (kWh)
 *    - Total Consumed (kWh)
 *    - Solar Utilized (Self-Consumed) (kWh)
 *    - Grid Imported (kWh)
 *    - Grid Exported (kWh)
 *    - Estimated Savings (INR)
 *    - Estimated CO2 Avoided (kg)
 *    - Notes
 *    - Action buttons: Edit, Delete
 * 2. Search by date, notes
 * 3. Filter by date range (Today, Last 7 Days, Last 30 Days, This Month, Custom)
 * 4. In-line Edit Modal with strict validation
 * 5. Delete Confirmation Modal
 * 6. CSV Data Export
 * 7. Clean empty state with button to "Log Today's Energy" when zero records exist.
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Download, Pencil, Trash2, Plus, Calendar, Search,
  AlertCircle, CheckCircle2, X, Zap, Sun, Leaf, Filter,
  ArrowRight, ShieldCheck, FileSpreadsheet
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Alert from '../../components/ui/Alert'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import {
  getEnergyLogs, saveEnergyLog, deleteEnergyLog,
  getUserSettings
} from '../../services/solarDataService'
import {
  calcRecordSelfConsumption, calcCostSaved, calcCO2Avoided,
  validateEnergyBalance
} from '../../utils/calculations'
import { formatDate } from '../../utils/formatters'
import { todayISO } from '../../utils/constants'

export default function MyRecordsPage() {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [userSettings, setUserSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 10

  // Edit Modal State
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({
    solar_generated_kwh: '',
    total_consumption_kwh: '',
    grid_import_kwh: '',
    grid_export_kwh: '',
    battery_charge_kwh: '',
    battery_discharge_kwh: '',
    notes: '',
  })
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Notification Toast
  const [alertInfo, setAlertInfo] = useState(null)

  async function loadData() {
    setLoading(true)
    try {
      const [userLogs, settings] = await Promise.all([
        getEnergyLogs(user?.id),
        getUserSettings(user?.id),
      ])
      setLogs(userLogs)
      setUserSettings(settings)
    } catch (err) {
      console.error('Failed to load records:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [user?.id])

  // Filter records
  const filtered = useMemo(() => {
    const today = todayISO()
    const now = new Date()

    return logs.filter((log) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchNotes = log.notes?.toLowerCase().includes(q)
        const matchDate = log.log_date?.includes(q)
        if (!matchNotes && !matchDate) return false
      }

      // 2. Date filter
      const d = log.log_date
      if (!d) return false

      if (dateFilter === 'today') {
        return d === today
      }

      if (dateFilter === '7days') {
        const cutoff = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0]
        return d >= cutoff
      }

      if (dateFilter === '30days') {
        const cutoff = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0]
        return d >= cutoff
      }

      if (dateFilter === 'thisMonth') {
        const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return d.startsWith(monthPrefix)
      }

      if (dateFilter === 'custom') {
        if (customStart && d < customStart) return false
        if (customEnd && d > customEnd) return false
        return true
      }

      return true
    })
  }, [logs, searchQuery, dateFilter, customStart, customEnd])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filtered.slice(start, start + PER_PAGE)
  }, [filtered, page])

  function openEditModal(log) {
    setEditTarget(log)
    setEditForm({
      solar_generated_kwh: String(log.solar_generated_kwh),
      total_consumption_kwh: String(log.total_consumption_kwh),
      grid_import_kwh: log.grid_import_kwh ? String(log.grid_import_kwh) : '0',
      grid_export_kwh: log.grid_export_kwh ? String(log.grid_export_kwh) : '0',
      battery_charge_kwh: log.battery_charge_kwh ? String(log.battery_charge_kwh) : '0',
      battery_discharge_kwh: log.battery_discharge_kwh ? String(log.battery_discharge_kwh) : '0',
      notes: log.notes || '',
    })
    setEditError('')
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    setEditError('')

    const gen = parseFloat(editForm.solar_generated_kwh)
    const con = parseFloat(editForm.total_consumption_kwh)
    const imp = editForm.grid_import_kwh !== '' ? parseFloat(editForm.grid_import_kwh) : 0
    const exp = editForm.grid_export_kwh !== '' ? parseFloat(editForm.grid_export_kwh) : 0
    const bChg = editForm.battery_charge_kwh !== '' ? parseFloat(editForm.battery_charge_kwh) : 0
    const bDis = editForm.battery_discharge_kwh !== '' ? parseFloat(editForm.battery_discharge_kwh) : 0

    if (isNaN(gen) || gen < 0) {
      setEditError('Solar generation must be a non-negative number.')
      return
    }
    if (isNaN(con) || con < 0) {
      setEditError('Total consumption must be a non-negative number.')
      return
    }
    if (isNaN(imp) || imp < 0) {
      setEditError('Grid imported must be a non-negative number.')
      return
    }
    if (isNaN(exp) || exp < 0) {
      setEditError('Grid exported must be a non-negative number.')
      return
    }
    if (isNaN(bChg) || bChg < 0 || isNaN(bDis) || bDis < 0) {
      setEditError('Battery values must be non-negative numbers.')
      return
    }
    if (exp > gen) {
      setEditError('Grid exported cannot exceed solar energy generated.')
      return
    }
    if (imp > con) {
      setEditError('Grid imported cannot exceed total electricity consumed.')
      return
    }
    if (bChg > gen) {
      setEditError('Battery charge cannot exceed solar energy generated.')
      return
    }

    const rawSelfUsed = (bChg > 0 || bDis > 0)
      ? Math.min(gen - exp - bChg + bDis, con - imp)
      : Math.min(gen - exp, con - imp)
    const selfConsumed = parseFloat(Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed))).toFixed(2))

    setSavingEdit(true)
    try {
      await saveEnergyLog(user?.id, {
        id: editTarget.id,
        log_date: editTarget.log_date,
        solar_generated_kwh: gen,
        total_consumption_kwh: con,
        solar_utilized_kwh: selfConsumed,
        grid_import_kwh: imp,
        grid_export_kwh: exp,
        battery_charge_kwh: bChg,
        battery_discharge_kwh: bDis,
        notes: editForm.notes,
      })

      setAlertInfo({
        variant: 'success',
        message: `Record for ${formatDate(editTarget.log_date)} updated successfully.`,
      })
      setEditTarget(null)
      await loadData()
    } catch (err) {
      setEditError(err.message || 'Failed to update record.')
    } finally {
      setSavingEdit(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEnergyLog(user?.id, deleteTarget.id)
      setAlertInfo({
        variant: 'success',
        message: `Record for ${formatDate(deleteTarget.log_date)} deleted.`,
      })
      setDeleteTarget(null)
      await loadData()
    } catch {
      setAlertInfo({ variant: 'error', message: 'Failed to delete record.' })
    } finally {
      setDeleting(false)
    }
  }

  function exportCSV() {
    if (filtered.length === 0) return

    const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
    const factor = Number(userSettings?.grid_emission_factor ?? 0.82)

    const headers = [
      'Date',
      'Solar_Generated_kWh',
      'Total_Consumed_kWh',
      'Solar_Utilized_kWh',
      'Grid_Import_kWh',
      'Grid_Export_kWh',
      'Battery_Charge_kWh',
      'Battery_Discharge_kWh',
      'Estimated_Savings_INR',
      'Estimated_CO2_Avoided_kg',
      'Notes',
    ]

    const rows = filtered.map((r) => {
      const gen = Math.max(0, Number(r.solar_generated_kwh) || 0)
      const con = Math.max(0, Number(r.total_consumption_kwh) || 0)
      const exp = Math.max(0, Number(r.grid_export_kwh) || 0)
      const imp = Math.max(0, Number(r.grid_import_kwh) || 0)
      const rawSelf = Math.min(gen - exp, con - imp)
      const selfUsed = Math.max(0, Math.min(gen, Math.min(con, Number(r.solar_utilized_kwh) || rawSelf)))
      const saved = calcCostSaved(selfUsed, tariff)
      const co2 = calcCO2Avoided(selfUsed, factor)
      return [
        r.log_date,
        gen.toFixed(2),
        con.toFixed(2),
        selfUsed.toFixed(2),
        exp.toFixed(2),
        imp.toFixed(2),
        (Number(r.battery_charge_kwh) || 0).toFixed(2),
        (Number(r.battery_discharge_kwh) || 0).toFixed(2),
        saved.toFixed(2),
        co2.toFixed(2),
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `solarconnect_energy_records_${todayISO()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <PageWrapper
        title="My Energy Records"
        subtitle="Historical table of your actual solar generation, household consumption, and financial savings."
      >
        {alertInfo && (
          <Alert
            variant={alertInfo.variant}
            className="mb-6"
            dismissible
            onDismiss={() => setAlertInfo(null)}
          >
            {alertInfo.message}
          </Alert>
        )}

        {/* Filter and Control Bar */}
        <Card className="border border-[#DCEBFA] shadow-sm mb-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-3 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by date (YYYY-MM-DD) or notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setPage(1)
                }}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
              />
            </div>

            {/* Date Range Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-[#F4FAFF] border border-[#DCEBFA] p-1 rounded-xl text-xs font-semibold text-[#153B65]">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'today', label: 'Today' },
                  { key: '7days', label: '7 Days' },
                  { key: '30days', label: '30 Days' },
                  { key: 'thisMonth', label: 'This Month' },
                  { key: 'custom', label: 'Custom' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setDateFilter(f.key)
                      setPage(1)
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      dateFilter === f.key
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#153B65] hover:bg-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <Button
                variant="outline"
                size="sm"
                onClick={exportCSV}
                disabled={filtered.length === 0}
                className="text-xs"
              >
                <Download size={13} className="mr-1.5" />
                Export CSV
              </Button>

              <Link to="/log">
                <Button variant="primary" size="sm" className="text-xs">
                  <Plus size={14} className="mr-1.5" />
                  Log Today
                </Button>
              </Link>
            </div>
          </div>

          {/* Custom Date Range Pickers */}
          {dateFilter === 'custom' && (
            <div className="mt-3 pt-3 border-t border-[#DCEBFA] flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-[#153B65]">Range:</span>
              <input
                type="date"
                value={customStart}
                onChange={(e) => {
                  setCustomStart(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#DCEBFA] text-xs text-[#153B65]"
              />
              <span className="text-[#64748B]">to</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => {
                  setCustomEnd(e.target.value)
                  setPage(1)
                }}
                className="px-2.5 py-1.5 rounded-lg border border-[#DCEBFA] text-xs text-[#153B65]"
              />
              {(customStart || customEnd) && (
                <button
                  onClick={() => {
                    setCustomStart('')
                    setCustomEnd('')
                  }}
                  className="text-rose-600 hover:underline text-xs ml-1"
                >
                  Clear dates
                </button>
              )}
            </div>
          )}
        </Card>

        {/* Records Table */}
        <Card className="border border-[#DCEBFA] shadow-sm overflow-hidden p-0">
          {logs.length === 0 ? (
            <div className="py-12 px-4">
              <EmptyState
                icon={Sun}
                title="No Energy Records Logged"
                description="Welcome to SolarConnect! Start by adding your first daily energy log to generate automated savings, self-sufficiency reports, and emissions analytics."
                action={
                  <Link to="/log">
                    <Button variant="primary" size="sm" className="text-xs">
                      <Plus size={14} className="mr-1.5" />
                      Log Today's Energy
                    </Button>
                  </Link>
                }
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 px-4">
              <EmptyState
                icon={Search}
                title="No Records Match Your Filter"
                description="Try clearing your search query or selecting a different date range."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('')
                      setDateFilter('all')
                      setCustomStart('')
                      setCustomEnd('')
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#F4FAFF] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#DCEBFA]">
                    <tr>
                      <th className="py-3 px-3.5">Date</th>
                      <th className="py-3 px-3.5 text-right">Solar Gen</th>
                      <th className="py-3 px-3.5 text-right">Total Con</th>
                      <th className="py-3 px-3.5 text-right">Self-Used</th>
                      <th className="py-3 px-3.5 text-right">Grid Imp</th>
                      <th className="py-3 px-3.5 text-right">Grid Exp</th>
                      <th className="py-3 px-3.5 text-right">Est. Savings</th>
                      <th className="py-3 px-3.5 text-right">CO₂ Avoided</th>
                      <th className="py-3 px-3.5">Notes</th>
                      <th className="py-3 px-3.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCEBFA]/50">
                    {paginatedRecords.map((log) => {
                      const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
                      const factor = Number(userSettings?.grid_emission_factor ?? 0.82)
                      const gen = Math.max(0, Number(log.solar_generated_kwh) || 0)
                      const con = Math.max(0, Number(log.total_consumption_kwh) || 0)
                      const exp = Math.max(0, Number(log.grid_export_kwh) || 0)
                      const imp = Math.max(0, Number(log.grid_import_kwh) || 0)
                      const rawSelf = Math.min(gen - exp, con - imp)
                      const safeUtilized = Math.max(0, Math.min(gen, Math.min(con, Number(log.solar_utilized_kwh) || rawSelf)))
                      const saved = calcCostSaved(safeUtilized, tariff)
                      const co2 = calcCO2Avoided(safeUtilized, factor)

                      return (
                        <tr key={log.id} className="hover:bg-[#EAF6FF]/35 transition-colors">
                          <td className="py-3 px-3.5 font-semibold text-[#153B65] whitespace-nowrap">
                            {formatDate(log.log_date)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-[#2563EB] whitespace-nowrap">
                            {gen.toFixed(2)} kWh
                          </td>
                          <td className="py-3 px-3.5 text-right text-[#153B65] whitespace-nowrap">
                            {con.toFixed(2)} kWh
                          </td>
                          <td className="py-3 px-3.5 text-right font-semibold text-[#22C55E] whitespace-nowrap">
                            {safeUtilized.toFixed(2)} kWh
                          </td>
                          <td className="py-3 px-3.5 text-right text-[#64748B] whitespace-nowrap">
                            {imp.toFixed(2)} kWh
                          </td>
                          <td className="py-3 px-3.5 text-right text-[#64748B] whitespace-nowrap">
                            {exp.toFixed(2)} kWh
                          </td>
                          <td className="py-3 px-3.5 text-right font-bold text-[#22C55E] whitespace-nowrap">
                            ₹{saved.toFixed(2)}
                          </td>
                          <td className="py-3 px-3.5 text-right text-[#153B65] whitespace-nowrap">
                            {co2.toFixed(2)} kg
                          </td>
                          <td className="py-3 px-3.5 text-[#64748B] max-w-xs truncate" title={log.notes}>
                            {log.notes || '—'}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => openEditModal(log)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EAF6FF] transition-colors"
                                title="Edit log"
                              >
                                <Pencil size={13} />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(log)}
                                className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete log"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {totalPages > 1 && (
                <div className="p-3.5 border-t border-[#DCEBFA] bg-[#F4FAFF] flex items-center justify-between text-xs text-[#64748B]">
                  <span>
                    Showing {Math.min(filtered.length, (page - 1) * PER_PAGE + 1)} to{' '}
                    {Math.min(filtered.length, page * PER_PAGE)} of {filtered.length} records
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-2.5 py-1 text-xs"
                    >
                      Prev
                    </Button>
                    <span className="font-semibold text-[#153B65] px-2">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-2.5 py-1 text-xs"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Edit Modal */}
        <Modal
          isOpen={Boolean(editTarget)}
          onClose={() => setEditTarget(null)}
          title={`Edit Record — ${formatDate(editTarget?.log_date)}`}
        >
          {editTarget && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <Alert variant="error" className="text-xs">
                  {editError}
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">
                    Solar Generated (kWh) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editForm.solar_generated_kwh}
                    onChange={(e) => setEditForm({ ...editForm, solar_generated_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">
                    Total Consumed (kWh) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editForm.total_consumption_kwh}
                    onChange={(e) => setEditForm({ ...editForm, total_consumption_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">Grid Imported (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.grid_import_kwh}
                    onChange={(e) => setEditForm({ ...editForm, grid_import_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">Grid Exported (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.grid_export_kwh}
                    onChange={(e) => setEditForm({ ...editForm, grid_export_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">Battery Charge (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.battery_charge_kwh}
                    onChange={(e) => setEditForm({ ...editForm, battery_charge_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#153B65] mb-1">Battery Discharge (kWh)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editForm.battery_discharge_kwh}
                    onChange={(e) => setEditForm({ ...editForm, battery_discharge_kwh: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#153B65] mb-1">Notes</label>
                <input
                  type="text"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#DCEBFA] text-xs text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#DCEBFA]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditTarget(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={savingEdit}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Energy Record?"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">
              Are you sure you want to delete the record for{' '}
              <strong className="text-[#153B65]">{formatDate(deleteTarget?.log_date)}</strong>? This will remove this day from all automated calculations.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#DCEBFA]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDelete}
                loading={deleting}
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Yes, Delete
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

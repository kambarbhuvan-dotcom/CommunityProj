/**
 * MyRecordsPage.jsx — Personal Energy Log History & Management
 *
 * Implements:
<<<<<<< HEAD
 * 1. Filterable & Paginated Table of personal energy records
 * 2. Real-time Search by date, notes, or building
 * 3. In-line Edit Modal with strict numeric validation
 * 4. Delete Confirmation Modal with live recalculation
 * 5. CSV Data Export
 */

import { useState, useEffect, useMemo } from 'react'
import { Download, Pencil, Trash2, Plus, Calendar, Search, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
<<<<<<< HEAD
import Toast from '../../components/ui/Toast'
import { Skeleton } from '../../components/ui/Skeleton'
import { formatDate, formatRelativeDate } from '../../utils/formatters'
import { calcCostSaved, calcEnergyBalance, calcCO2Avoided } from '../../utils/calculations'
import { getAllRecords, saveRecord, deleteRecord } from '../../services/energyStorageService'
import { ELECTRICITY_RATE } from '../../utils/constants'

const COLUMNS = [
  'Date', 'Community / Building', 'Generated', 'Utilized', 'Consumed', 'Difference', 'Saved', 'CO₂', 'Status', 'Notes', 'Actions',
]

export default function MyRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Edit State
  const [editTarget, setEditTarget] = useState(null)
  const [editForm, setEditForm] = useState({
    solar_generated_kwh: '',
    consumption_kwh: '',
    solar_utilized_kwh: '',
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    notes: '',
  })
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

<<<<<<< HEAD
  // Toast
  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg, isError = false) {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage((curr) => (curr?.text === msg ? null : curr)), 3500)
  }

  const tariff = useMemo(() => {
    const saved = localStorage.getItem('solarconnect_tariff')
    return saved !== null ? parseFloat(saved) : ELECTRICITY_RATE
  }, [])

  const loadData = async () => {
    setLoading(true)
    const data = await getAllRecords()
    setRecords(data)
    setLoading(false)
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
  }

  useEffect(() => {
    loadData()
<<<<<<< HEAD
  }, [])
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae

  function openEditModal(log) {
    setEditTarget(log)
    setEditForm({
<<<<<<< HEAD
      solar_generated_kwh: log.solar_generated_kwh,
      consumption_kwh: log.consumption_kwh,
      solar_utilized_kwh: log.solar_utilized_kwh,
=======
      solar_generated_kwh: String(log.solar_generated_kwh),
      total_consumption_kwh: String(log.total_consumption_kwh),
      grid_import_kwh: log.grid_import_kwh ? String(log.grid_import_kwh) : '0',
      grid_export_kwh: log.grid_export_kwh ? String(log.grid_export_kwh) : '0',
      battery_charge_kwh: log.battery_charge_kwh ? String(log.battery_charge_kwh) : '0',
      battery_discharge_kwh: log.battery_discharge_kwh ? String(log.battery_discharge_kwh) : '0',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
      notes: log.notes || '',
    })
    setEditError('')
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
<<<<<<< HEAD
    const gen = parseFloat(editForm.solar_generated_kwh)
    const con = parseFloat(editForm.consumption_kwh)
    const uti = parseFloat(editForm.solar_utilized_kwh)
=======
    setEditError('')

    const gen = parseFloat(editForm.solar_generated_kwh)
    const con = parseFloat(editForm.total_consumption_kwh)
    const imp = editForm.grid_import_kwh !== '' ? parseFloat(editForm.grid_import_kwh) : 0
    const exp = editForm.grid_export_kwh !== '' ? parseFloat(editForm.grid_export_kwh) : 0
    const bChg = editForm.battery_charge_kwh !== '' ? parseFloat(editForm.battery_charge_kwh) : 0
    const bDis = editForm.battery_discharge_kwh !== '' ? parseFloat(editForm.battery_discharge_kwh) : 0
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae

    if (isNaN(gen) || gen < 0) {
      setEditError('Solar generation must be a non-negative number.')
      return
    }
    if (isNaN(con) || con < 0) {
<<<<<<< HEAD
      setEditError('Electricity consumption must be a non-negative number.')
      return
    }
    if (isNaN(uti) || uti < 0) {
      setEditError('Solar utilization must be a non-negative number.')
      return
    }
    if (uti > gen) {
      setEditError('Solar utilized cannot exceed solar generated.')
      return
    }
    if (uti > con) {
      setEditError('Solar utilized cannot exceed electricity consumed.')
      return
    }

    setSavingEdit(true)
    try {
      await saveRecord({
        ...editTarget,
        solar_generated_kwh: gen,
        consumption_kwh: con,
        solar_utilized_kwh: uti,
        notes: editForm.notes,
      })
      showToast('Record updated successfully.')
      setEditTarget(null)
      loadData()
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    } catch (err) {
      setEditError(err.message || 'Failed to update record.')
    } finally {
      setSavingEdit(false)
    }
  }

<<<<<<< HEAD
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    await deleteRecord(deleteTarget.id)
    setDeleting(false)
    setDeleteTarget(null)
    showToast(`Deleted record for ${formatDate(deleteTarget.log_date)}.`)
    loadData()
  }

  const exportCSV = () => {
    const header = 'Date,Building,Generated_kWh,Utilized_kWh,Consumed_kWh,Difference_kWh,Saved_INR,CO2_kg,Demo,Notes\n'
    const rows = filtered.map((r) => {
      const diff = calcEnergyBalance(r.solar_generated_kwh, r.consumption_kwh)
      const saved = calcCostSaved(r.solar_utilized_kwh, tariff)
      const co2 = calcCO2Avoided(r.solar_generated_kwh)
      return `${r.log_date},"${r.building || ''}",${r.solar_generated_kwh},${r.solar_utilized_kwh},${r.consumption_kwh},${diff.toFixed(2)},${saved.toFixed(2)},${co2.toFixed(2)},${Boolean(r.is_demo)},"${(r.notes || '').replace(/"/g, '""')}"`
    }).join('\n')

    const blob = new Blob([header + rows], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `solarconnect-my-records-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(
      (r) =>
        r.building?.toLowerCase().includes(q) ||
        r.log_date?.includes(q) ||
        r.notes?.toLowerCase().includes(q)
    )
  }, [records, search])

  const PER_PAGE = 10
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae

  return (
    <AppLayout>
      <PageWrapper
        title="My Energy Records"
<<<<<<< HEAD
        subtitle="Complete chronological history of your logged solar generation and household consumption."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={exportCSV} disabled={records.length === 0}>
              <Download size={14} /> Export CSV
            </Button>
            <Link to="/log">
              <Button variant="primary" size="sm">
                <Plus size={14} /> Log Energy
              </Button>
            </Link>
          </div>
        }
      >
        {/* Toast */}
        {toastMessage && (
          <Toast
            message={toastMessage.text}
            type={toastMessage.isError ? 'error' : 'success'}
            onClose={() => setToastMessage(null)}
          />
        )}

        {/* Search */}
        <div className="mb-4 max-w-xs relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search records…"
            className="form-input pl-9 text-xs py-2 w-full bg-[#F4FAFF] border-[#DCEBFA] text-[#153B65] focus:bg-white"
          />
        </div>

        {/* Table */}
        <Card className="p-0 overflow-hidden shadow-xs border border-[#DCEBFA]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA] text-left">
                  {COLUMNS.map((h) => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-[#64748B] uppercase whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEBFA]">
                {loading ? (
                  Array.from({ length: 5 }).map((_, r) => (
                    <tr key={r} className="animate-pulse">
                      {Array.from({ length: COLUMNS.length }).map((_, c) => (
                        <td key={c} className="px-4 py-3.5">
                          <Skeleton className="h-4 w-16" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNS.length}>
                      <EmptyState
                        icon={Calendar}
                        title="No records found"
                        description="Log your energy records in the Energy Tracking module to see them here."
                      />
                    </td>
                  </tr>
                ) : (
                  paginated.map((log) => {
                    const diff = calcEnergyBalance(log.solar_generated_kwh, log.consumption_kwh)
                    const saved = calcCostSaved(log.solar_utilized_kwh, tariff)
                    const co2 = calcCO2Avoided(log.solar_generated_kwh)
                    return (
                      <tr key={log.id} className="hover:bg-[#F4FAFF] transition-colors">
                        <td className="px-4 py-3 font-medium text-[#153B65] whitespace-nowrap">
                          {formatDate(log.log_date)}
                          <span className="block text-[11px] text-[#64748B] font-normal">
                            {formatRelativeDate(log.log_date)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                          {log.building || 'Community Building'}
                        </td>
                        <td className="px-4 py-3 text-[#2563EB] font-semibold whitespace-nowrap">
                          {log.solar_generated_kwh} kWh
                        </td>
                        <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                          {log.solar_utilized_kwh} kWh
                        </td>
                        <td className="px-4 py-3 text-[#153B65] whitespace-nowrap">
                          {log.consumption_kwh} kWh
                        </td>
                        <td className={`px-4 py-3 font-semibold whitespace-nowrap ${diff >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
                          {diff >= 0 ? '+' : ''}{diff.toFixed(2)} kWh
                        </td>
                        <td className="px-4 py-3 text-[#22C55E] font-semibold whitespace-nowrap">
                          ₹{saved.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                          {co2.toFixed(2)} kg
                        </td>
                        <td className="px-4 py-3">
                          {log.is_demo ? <Badge variant="demo">DEMO</Badge> : <Badge variant="eco">VERIFIED</Badge>}
                        </td>
                        <td className="px-4 py-3 text-[#64748B] max-w-[120px] truncate">
                          {log.notes || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(log)}
                              className="p-1.5 rounded-lg hover:bg-[#EAF6FF] text-[#2563EB] transition-colors"
                              title="Edit Record"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(log)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#DCEBFA] text-xs text-[#64748B] bg-white">
              <span>
                Page {page} of {totalPages} ({filtered.length} total entries)
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Prev
                </Button>
                <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
            </div>
          )}
        </Card>

<<<<<<< HEAD
        {/* Edit Modal */}
        <Modal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          title={`Edit Record — ${editTarget ? formatDate(editTarget.log_date) : ''}`}
          size="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4">
            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {editError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Generated (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input text-sm"
                  value={editForm.solar_generated_kwh}
                  onChange={(e) => setEditForm({ ...editForm, solar_generated_kwh: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Consumed (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input text-sm"
                  value={editForm.consumption_kwh}
                  onChange={(e) => setEditForm({ ...editForm, consumption_kwh: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Utilized (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input text-sm"
                  value={editForm.solar_utilized_kwh}
                  onChange={(e) => setEditForm({ ...editForm, solar_utilized_kwh: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Notes (Optional)</label>
              <textarea
                rows={2}
                className="form-input resize-none text-sm"
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>

        {/* Delete confirmation modal */}
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Entry" size="sm">
          <p className="text-sm text-charcoal-300 mb-5">
            Are you sure you want to delete the entry for <strong>{formatDate(deleteTarget?.log_date)}</strong>? This will remove it from all tracking records.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" loading={deleting} onClick={handleDelete}>
              Delete
            </Button>
=======
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

/**
 * LogEnergyPage.jsx — Complete Solar Energy Usage Tracking Module
 *
 * Implements:
 * 1. Add Energy Record (Date, Community/Building, Gen, Consumption, Utilized, Notes)
 * 2. Display Records Table (Date, Building, Gen, Consumption, Utilized, Diff, Est. Savings, Actions)
 * 3. Record Management (Add, Edit, Delete with confirmations)
 * 4. Search & Date Filtering (Today, Last 7 days, Last 30 days, This Month, Custom range)
 * 5. Strict Validation:
 *    - No negative numbers
 *    - No empty required fields
 *    - Strict numeric validation
 *    - Prevention of impossible solar utilization (utilized cannot exceed generated OR consumption)
 *    - Duplicate record detection and warning
 * 6. Calculations:
 *    - Automatic Daily & Monthly totals
 *    - Difference = Generation - Consumption
 *    - Estimated Savings = Solar Utilized × Configurable Tariff
 * 7. Clean UI with modal forms, notification banners, pagination, and CSV export.
 */

import { useState, useMemo, useEffect } from 'react'
import {
  Zap, Sun, Calendar, Building2, Plus, Pencil, Trash2, Search,
  Download, AlertTriangle, CheckCircle2, XCircle, Info, RefreshCw,
  Scale, ArrowUpRight, ArrowDownRight, DollarSign, X, Check,
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import Toast from '../../components/ui/Toast'
import { Skeleton } from '../../components/ui/Skeleton'

// Services & Utils
import {
  getAllRecords, saveRecord, deleteRecord, checkDuplicateRecord,
  getCommunityList, resetRecordsToDemo, calculateRecordTotals,
} from '../../services/energyStorageService'
import { calcCostSaved, calcEnergyBalance, formatKwh, formatCurrency } from '../../utils/calculations'
import { formatDate, formatRelativeDate } from '../../utils/formatters'
import { ELECTRICITY_RATE, todayISO } from '../../utils/constants'

export default function LogEnergyPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState([])

  // Notification state: { type: 'success' | 'error' | 'warning', message: string } | null
  const [notification, setNotification] = useState(null)

  // Configurable tariff
  const [tariff] = useState(() => {
    const saved = localStorage.getItem('solarconnect_tariff')
    return saved !== null ? parseFloat(saved) : ELECTRICITY_RATE
  })

  // ─── Filter & Search State ─────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'custom'
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [page, setPage] = useState(1)
  const PER_PAGE = 8

  // ─── Modal / Form State ───────────────────────────────────────────────────
  const [modalOpen, setModalOpen] = useState(false)
  const [editingRecordId, setEditingRecordId] = useState(null)
  const [formData, setFormData] = useState({
    log_date: todayISO(),
    building: '',
    solar_generated_kwh: '',
    consumption_kwh: '',
    solar_utilized_kwh: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [duplicateWarning, setDuplicateWarning] = useState(null)
  const [saving, setSaving] = useState(false)

  // ─── Delete Confirmation Modal ────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Auto-dismiss notification after 4.5s
  const showNotification = (type, message) => {
    setNotification({ type, message })
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr))
    }, 4500)
  }

  // ─── Initial Load ──────────────────────────────────────────────────────────
  const fetchRecords = async () => {
    setLoading(true)
    try {
      const data = await getAllRecords()
      setRecords(data)
      setCommunities(getCommunityList())
    } catch (err) {
      console.error(err)
      showNotification('error', 'Failed to load energy records.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  // ─── Daily and Monthly Summary Totals (Automatic Calculations) ───────────
  const summaryTotals = useMemo(() => {
    const today = todayISO()
    const now = new Date()
    const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const todayRecords = records.filter((r) => r.log_date === today)
    const monthRecords = records.filter((r) => r.log_date?.startsWith(currentMonthPrefix))

    const daily = calculateRecordTotals(todayRecords, tariff)
    const monthly = calculateRecordTotals(monthRecords, tariff)

    return { daily, monthly }
  }, [records, tariff])

  // ─── Filtered and Searched Records ─────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    return records.filter((record) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const matchBuilding = record.building?.toLowerCase().includes(query)
        const matchNotes = record.notes?.toLowerCase().includes(query)
        const matchDate = record.log_date?.includes(query)
        if (!matchBuilding && !matchNotes && !matchDate) return false
      }

      // 2. Date filter
      const rDate = record.log_date
      if (!rDate) return false

      if (dateFilter === 'today') {
        return rDate === today
      }
      if (dateFilter === '7days') {
        const thresh = new Date(now)
        thresh.setDate(thresh.getDate() - 6)
        const threshStr = thresh.toISOString().split('T')[0]
        return rDate >= threshStr && rDate <= today
      }
      if (dateFilter === '30days') {
        const thresh = new Date(now)
        thresh.setDate(thresh.getDate() - 29)
        const threshStr = thresh.toISOString().split('T')[0]
        return rDate >= threshStr && rDate <= today
      }
      if (dateFilter === 'thisMonth') {
        const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        return rDate.startsWith(prefix)
      }
      if (dateFilter === 'custom') {
        if (customStart && customEnd) {
          return rDate >= customStart && rDate <= customEnd
        }
      }

      return true
    })
  }, [records, searchQuery, dateFilter, customStart, customEnd])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PER_PAGE))
  const paginatedRecords = useMemo(() => {
    const start = (page - 1) * PER_PAGE
    return filteredRecords.slice(start, start + PER_PAGE)
  }, [filteredRecords, page])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [searchQuery, dateFilter, customStart, customEnd])

  // ─── Form Handlers & Real-time Validation ──────────────────────────────────
  const handleOpenAdd = () => {
    setEditingRecordId(null)
    setFormData({
      log_date: todayISO(),
      building: communities[0] || 'Sunrise Apartments Block A',
      solar_generated_kwh: '',
      consumption_kwh: '',
      solar_utilized_kwh: '',
      notes: '',
    })
    setFormErrors({})
    setDuplicateWarning(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (record) => {
    setEditingRecordId(record.id)
    setFormData({
      log_date: record.log_date,
      building: record.building || communities[0] || 'Sunrise Apartments Block A',
      solar_generated_kwh: record.solar_generated_kwh.toString(),
      consumption_kwh: record.consumption_kwh.toString(),
      solar_utilized_kwh: record.solar_utilized_kwh.toString(),
      notes: record.notes || '',
    })
    setFormErrors({})
    setDuplicateWarning(null)
    setModalOpen(true)
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)

    // Clear error for edited field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }))
    }

    // Check duplicate warning if date or building changes
    if (name === 'log_date' || name === 'building') {
      const targetDate = name === 'log_date' ? value : updated.log_date
      const targetBuilding = name === 'building' ? value : updated.building
      if (targetDate && targetBuilding) {
        const dup = checkDuplicateRecord(targetDate, targetBuilding, editingRecordId)
        setDuplicateWarning(dup)
      } else {
        setDuplicateWarning(null)
      }
    }
  }

  // Auto-calculate realistic solar utilized: MIN(generation, consumption)
  const handleAutoCalculateUtilized = () => {
    const gen = parseFloat(formData.solar_generated_kwh)
    const con = parseFloat(formData.consumption_kwh)
    if (!isNaN(gen) && !isNaN(con) && gen >= 0 && con >= 0) {
      const autoVal = Math.min(gen, con).toFixed(2)
      setFormData((prev) => ({ ...prev, solar_utilized_kwh: autoVal }))
      if (formErrors.solar_utilized_kwh) {
        setFormErrors((prev) => ({ ...prev, solar_utilized_kwh: null }))
      }
    }
  }

  // ─── Comprehensive Validation Rules ────────────────────────────────────────
  const validateForm = () => {
    const errors = {}

    // 1. Required fields
    if (!formData.log_date) errors.log_date = 'Date is required.'
    if (!formData.building || !formData.building.trim()) errors.building = 'Community or building name is required.'

    // 2. Numeric checks
    const gen = parseFloat(formData.solar_generated_kwh)
    const con = parseFloat(formData.consumption_kwh)
    const uti = parseFloat(formData.solar_utilized_kwh)

    if (formData.solar_generated_kwh === '' || isNaN(gen)) {
      errors.solar_generated_kwh = 'Enter a valid solar generation number.'
    } else if (gen < 0) {
      errors.solar_generated_kwh = 'Solar generation cannot be negative.'
    }

    if (formData.consumption_kwh === '' || isNaN(con)) {
      errors.consumption_kwh = 'Enter a valid consumption number.'
    } else if (con < 0) {
      errors.consumption_kwh = 'Consumption cannot be negative.'
    }

    if (formData.solar_utilized_kwh === '' || isNaN(uti)) {
      errors.solar_utilized_kwh = 'Enter a valid solar utilization number.'
    } else if (uti < 0) {
      errors.solar_utilized_kwh = 'Solar utilization cannot be negative.'
    }

    // 3. Prevent impossible solar utilization values
    if (!isNaN(uti) && !isNaN(gen) && uti > gen) {
      errors.solar_utilized_kwh = `Impossible value: Solar utilized (${uti} kWh) cannot exceed generated (${gen} kWh).`
    } else if (!isNaN(uti) && !isNaN(con) && uti > con) {
      errors.solar_utilized_kwh = `Impossible value: Solar utilized (${uti} kWh) cannot exceed household consumption (${con} kWh).`
    }

    return errors
  }

  // ─── Save Record (Add or Edit) ─────────────────────────────────────────────
  const handleSubmitRecord = async (e) => {
    e.preventDefault()

    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    setSaving(true)
    try {
      const saved = await saveRecord({
        id: editingRecordId,
        log_date: formData.log_date,
        building: formData.building,
        solar_generated_kwh: parseFloat(formData.solar_generated_kwh),
        consumption_kwh: parseFloat(formData.consumption_kwh),
        solar_utilized_kwh: parseFloat(formData.solar_utilized_kwh),
        notes: formData.notes,
        is_demo: false, // User record
      })

      await fetchRecords()
      setModalOpen(false)
      showNotification(
        'success',
        editingRecordId ? 'Record updated successfully!' : 'New energy record saved successfully!'
      )
    } catch (err) {
      console.error(err)
      showNotification('error', 'Error saving energy record. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Delete Record ─────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteRecord(deleteTarget.id)
      await fetchRecords()
      setDeleteTarget(null)
      showNotification('success', 'Record deleted successfully.')
    } catch (err) {
      console.error(err)
      showNotification('error', 'Failed to delete record.')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Reset to Initial Demo Data ────────────────────────────────────────────
  const handleResetDemo = async () => {
    if (window.confirm('Reset all tracking entries to the standard 90-day demo dataset?')) {
      await resetRecordsToDemo()
      await fetchRecords()
      showNotification('info', 'Reset energy tracking records to standard demo data.')
    }
  }

  // ─── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      showNotification('error', 'No records available to export.')
      return
    }

    const headers = [
      'Date',
      'Community/Building',
      'Solar Generated (kWh)',
      'Electricity Consumed (kWh)',
      'Solar Utilized (kWh)',
      'Difference (Gen - Con kWh)',
      'Estimated Savings (INR)',
      'Notes',
    ].join(',')

    const rows = filteredRecords.map((r) => {
      const diff = calcEnergyBalance(r.solar_generated_kwh, r.consumption_kwh)
      const savings = calcCostSaved(r.solar_utilized_kwh, tariff)
      return [
        r.log_date,
        `"${r.building || ''}"`,
        r.solar_generated_kwh,
        r.consumption_kwh,
        r.solar_utilized_kwh,
        diff.toFixed(2),
        savings.toFixed(2),
        `"${(r.notes || '').replace(/"/g, '""')}"`,
      ].join(',')
    })

    const csvContent = [headers, ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `solarconnect_energy_tracking_${todayISO()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    showNotification('success', 'Exported records to CSV successfully!')
  }

  // Live modal preview calculations
  const modalGen = parseFloat(formData.solar_generated_kwh) || 0
  const modalCon = parseFloat(formData.consumption_kwh) || 0
  const modalUti = parseFloat(formData.solar_utilized_kwh) || 0
  const modalDiff = calcEnergyBalance(modalGen, modalCon)
  const modalSavings = calcCostSaved(modalUti, tariff)

  return (
    <AppLayout>
      <PageWrapper
        title="Solar Energy Usage Tracking"
        subtitle="Log, monitor, and manage solar generation, consumption, and financial savings records."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handleExportCSV}>
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={handleOpenAdd}>
              <Plus size={15} /> Add Energy Record
            </Button>
          </div>
        }
      >
        {/* ── Toast Notification Banner ───────────────────────────────────── */}
        {notification && (
          <Toast
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}

        {/* ── Daily & Monthly Totals Cards (Automatic Calculations) ──────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          {/* Daily Totals (Today) */}
          <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                  <Sun size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#153B65]">Daily Totals (Today)</h3>
                  <p className="text-[11px] text-[#64748B]">{formatDate(todayISO())}</p>
                </div>
              </div>
              <Badge variant="eco">{summaryTotals.daily.count} entries</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DCEBFA]">
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Generation</p>
                <p className="text-sm font-bold text-[#2563EB]">{summaryTotals.daily.totalGen} kWh</p>
              </div>
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Consumption</p>
                <p className="text-sm font-bold text-[#153B65]">{summaryTotals.daily.totalConsumed} kWh</p>
              </div>
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Difference</p>
                <p className={`text-sm font-bold ${summaryTotals.daily.difference >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
                  {summaryTotals.daily.difference >= 0 ? '+' : ''}{summaryTotals.daily.difference} kWh
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1 text-xs">
              <span className="text-[#64748B]">Today's Solar Utilized: <strong className="text-[#153B65]">{summaryTotals.daily.totalUtilized} kWh</strong></span>
              <span className="text-[#22C55E] font-bold">Est. Savings: ₹{Math.round(summaryTotals.daily.savings).toLocaleString()}</span>
            </div>
          </div>

          {/* Monthly Totals (This Month) */}
          <div className="bg-white rounded-2xl shadow-card p-5 border border-[#DCEBFA]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#0EA5E9]">
                  <Calendar size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#153B65]">Monthly Totals (This Month)</h3>
                  <p className="text-[11px] text-[#64748B]">
                    {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <Badge variant="solar">{summaryTotals.monthly.count} records</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DCEBFA]">
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Month Gen</p>
                <p className="text-sm font-bold text-[#2563EB]">{summaryTotals.monthly.totalGen} kWh</p>
              </div>
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Month Load</p>
                <p className="text-sm font-bold text-[#153B65]">{summaryTotals.monthly.totalConsumed} kWh</p>
              </div>
              <div className="bg-[#F4FAFF] border border-[#DCEBFA] rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-[#64748B] font-medium">Net Difference</p>
                <p className={`text-sm font-bold ${summaryTotals.monthly.difference >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
                  {summaryTotals.monthly.difference >= 0 ? '+' : ''}{summaryTotals.monthly.difference} kWh
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between px-1 text-xs">
              <span className="text-[#64748B]">Utilized: <strong className="text-[#153B65]">{summaryTotals.monthly.totalUtilized} kWh</strong></span>
              <span className="text-[#22C55E] font-bold">Month Savings: ₹{Math.round(summaryTotals.monthly.savings).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ── Search & Date Filtering Control Bar ─────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-card p-4 mb-5 border border-[#DCEBFA]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-sm">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search community, date, or notes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input pl-9 text-xs bg-[#F4FAFF] border-[#DCEBFA] text-[#153B65] focus:bg-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#153B65]"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all',       label: 'All' },
                { id: 'today',     label: 'Today' },
                { id: '7days',     label: 'Last 7 days' },
                { id: '30days',    label: 'Last 30 days' },
                { id: 'thisMonth', label: 'This month' },
                { id: 'custom',    label: 'Custom' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    dateFilter === f.id
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F4FAFF] text-[#64748B] hover:bg-[#EAF6FF] hover:text-[#2563EB] border border-[#DCEBFA]'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <button
                onClick={handleResetDemo}
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#2563EB] hover:bg-[#EAF6FF] border border-dashed border-[#DCEBFA] flex items-center gap-1 ml-1 transition-colors"
                title="Reset local storage back to demo data"
              >
                <RefreshCw size={12} /> Reset Data
              </button>
            </div>
          </div>

          {/* Custom Date Range Row */}
          {dateFilter === 'custom' && (
            <div className="mt-3 pt-3 border-t border-[#DCEBFA] flex items-center gap-3 text-xs bg-[#F4FAFF] p-2.5 rounded-xl border border-[#DCEBFA]">
              <span className="font-semibold text-[#153B65]">Date Range:</span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="px-2 py-1 bg-white border border-[#DCEBFA] rounded-lg text-xs text-[#153B65]"
                />
                <span className="text-[#64748B]">to</span>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="px-2 py-1 bg-white border border-[#DCEBFA] rounded-lg text-xs text-[#153B65]"
                />
              </div>
              <span className="text-[11px] text-[#64748B] ml-auto">
                Showing entries between selected dates
              </span>
            </div>
          )}
        </div>

        {/* ── Main Records Data Table ─────────────────────────────────────── */}
        <Card className="p-0 overflow-hidden mb-6 border border-[#DCEBFA]">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F4FAFF] border-b border-[#DCEBFA]">
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wide">Community / Building</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Solar Gen</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Consumed</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Utilized</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Difference</th>
                  <th className="px-4 py-3.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wide">Est. Savings</th>
                  <th className="px-4 py-3.5 text-center text-xs font-semibold text-[#64748B] uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCEBFA]">
                {loading ? (
                  Array.from({ length: 6 }).map((_, r) => (
                    <tr key={r} className="animate-pulse">
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-36" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-4 w-16 ml-auto" /></td>
                      <td className="px-4 py-3.5"><Skeleton className="h-6 w-14 mx-auto rounded-lg" /></td>
                    </tr>
                  ))
                ) : paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12">
                      <EmptyState
                        icon={Calendar}
                        title="No tracking records found"
                        description="No energy entries match your current search or date criteria."
                        action={{
                          label: 'Add First Record',
                          onClick: handleOpenAdd,
                        }}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((r) => {
                    const diff = calcEnergyBalance(r.solar_generated_kwh, r.consumption_kwh)
                    const savings = calcCostSaved(r.solar_utilized_kwh, tariff)

                    return (
                      <tr key={r.id} className="hover:bg-[#F4FAFF] transition-colors">
                        {/* Date */}
                        <td className="px-4 py-3 font-medium text-[#153B65] whitespace-nowrap">
                          {formatDate(r.log_date)}
                          <span className="block text-[11px] text-[#64748B] font-normal">
                            {formatRelativeDate(r.log_date)}
                          </span>
                        </td>

                        {/* Community or Building */}
                        <td className="px-4 py-3 text-[#64748B] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Building2 size={13} className="text-[#2563EB] shrink-0" />
                            <span className="font-semibold text-[#153B65]">{r.building || 'Community Building'}</span>
                          </div>
                          {r.notes && (
                            <span className="text-[11px] text-[#64748B] truncate max-w-[180px] block mt-0.5" title={r.notes}>
                              {r.notes}
                            </span>
                          )}
                        </td>

                        {/* Solar Generation */}
                        <td className="px-4 py-3 text-right font-semibold text-[#2563EB] whitespace-nowrap">
                          {r.solar_generated_kwh} kWh
                        </td>

                        {/* Electricity Consumed */}
                        <td className="px-4 py-3 text-right text-[#153B65] font-medium whitespace-nowrap">
                          {r.consumption_kwh} kWh
                        </td>

                        {/* Solar Utilized */}
                        <td className="px-4 py-3 text-right text-[#64748B] whitespace-nowrap">
                          {r.solar_utilized_kwh} kWh
                        </td>

                        {/* Difference (Generation - Consumption) */}
                        <td className="px-4 py-3 text-right font-semibold whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 ${diff >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
                            {diff >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                            {diff >= 0 ? '+' : ''}{diff.toFixed(2)} kWh
                          </span>
                        </td>

                        {/* Estimated Savings */}
                        <td className="px-4 py-3 text-right font-semibold text-[#22C55E] whitespace-nowrap">
                          ₹{savings.toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(r)}
                              className="p-1.5 rounded-lg hover:bg-[#EAF6FF] text-[#2563EB] transition-colors"
                              title="Edit record"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(r)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 size={14} />
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

          {/* Table Footer with Pagination */}
          {filteredRecords.length > 0 && (
            <div className="px-5 py-3.5 border-t border-[#DCEBFA] flex items-center justify-between text-xs text-[#64748B] bg-white">
              <span>
                Showing <strong>{(page - 1) * PER_PAGE + 1}</strong> –{' '}
                <strong>{Math.min(page * PER_PAGE, filteredRecords.length)}</strong> of{' '}
                <strong>{filteredRecords.length}</strong> total records
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="font-semibold text-[#153B65]">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* ── Modal: Add / Edit Energy Record ──────────────────────────────── */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingRecordId ? 'Edit Energy Record' : 'Add New Energy Record'}
          size="lg"
        >
          <form onSubmit={handleSubmitRecord} className="space-y-4">
            {/* Duplicate Warning Alert */}
            {duplicateWarning && (
              <div className="p-3.5 rounded-xl bg-solar-50 border border-solar-200 text-xs text-solar-800 flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-solar-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Duplicate Entry Warning</p>
                  <p className="mt-0.5 leading-relaxed">
                    A record already exists for <strong>{duplicateWarning.building}</strong> on{' '}
                    <strong>{formatDate(duplicateWarning.log_date)}</strong> ({duplicateWarning.solar_generated_kwh} kWh generated).
                    Saving will overwrite this existing day's entry.
                  </p>
                </div>
              </div>
            )}

            {/* Row 1: Date & Community Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="log_date">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="log_date"
                  name="log_date"
                  type="date"
                  max={todayISO()}
                  value={formData.log_date}
                  onChange={handleFormChange}
                  className={`form-input ${formErrors.log_date ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                {formErrors.log_date && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.log_date}</p>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="building">
                  Community or Building Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="building"
                  name="building"
                  type="text"
                  list="community-suggestions"
                  placeholder="e.g. Sunrise Apartments Block A"
                  value={formData.building}
                  onChange={handleFormChange}
                  className={`form-input ${formErrors.building ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                <datalist id="community-suggestions">
                  {communities.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {formErrors.building && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.building}</p>
                )}
              </div>
            </div>

            {/* Row 2: Solar Generated & Electricity Consumed */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label" htmlFor="solar_generated_kwh">
                  Solar Energy Generated (kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  id="solar_generated_kwh"
                  name="solar_generated_kwh"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 24.50"
                  value={formData.solar_generated_kwh}
                  onChange={handleFormChange}
                  className={`form-input ${formErrors.solar_generated_kwh ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                {formErrors.solar_generated_kwh && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.solar_generated_kwh}</p>
                )}
              </div>

              <div>
                <label className="form-label" htmlFor="consumption_kwh">
                  Electricity Consumed (kWh) <span className="text-red-500">*</span>
                </label>
                <input
                  id="consumption_kwh"
                  name="consumption_kwh"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 19.80"
                  value={formData.consumption_kwh}
                  onChange={handleFormChange}
                  className={`form-input ${formErrors.consumption_kwh ? 'border-red-400 focus:ring-red-300' : ''}`}
                />
                {formErrors.consumption_kwh && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.consumption_kwh}</p>
                )}
              </div>
            </div>

            {/* Row 3: Solar Utilized (with Auto-Set helper) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0" htmlFor="solar_utilized_kwh">
                  Solar Energy Utilized (kWh) <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoCalculateUtilized}
                  className="text-xs text-[#2563EB] hover:underline font-semibold"
                >
                  ⚡ Auto-Calculate (MIN of Gen & Con)
                </button>
              </div>
              <input
                id="solar_utilized_kwh"
                name="solar_utilized_kwh"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 18.20"
                value={formData.solar_utilized_kwh}
                onChange={handleFormChange}
                className={`form-input ${formErrors.solar_utilized_kwh ? 'border-red-400 focus:ring-red-300' : ''}`}
              />
              <p className="text-[11px] text-[#64748B] mt-1">
                Must be non-negative and cannot exceed total solar generated or total consumption.
              </p>
              {formErrors.solar_utilized_kwh && (
                <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.solar_utilized_kwh}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="form-label" htmlFor="notes">
                Notes <span className="text-[#64748B] font-normal">(optional)</span>
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                placeholder="e.g. Sunny day, panels cleaned in the morning…"
                value={formData.notes}
                onChange={handleFormChange}
                className="form-input resize-none"
              />
            </div>

            {/* Live Calculation Preview Card */}
            <div className="bg-[#F4FAFF] rounded-xl p-3.5 border border-[#DCEBFA]">
              <p className="text-xs font-semibold text-[#153B65] mb-2 flex items-center gap-1.5">
                <Scale size={14} className="text-[#2563EB]" />
                Live Calculation Preview
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-charcoal-300">Energy Difference (Gen − Con):</span>
                  <p className={`text-sm font-bold ${modalDiff >= 0 ? 'text-forest' : 'text-red-500'}`}>
                    {modalDiff >= 0 ? '+' : ''}{modalDiff.toFixed(2)} kWh{' '}
                    <span className="text-[11px] font-normal">({modalDiff >= 0 ? 'Surplus' : 'Deficit'})</span>
                  </p>
                </div>
                <div>
                  <span className="text-charcoal-300">Estimated Savings (@ ₹{tariff}/kWh):</span>
                  <p className="text-sm font-bold text-solar-600">
                    ₹{modalSavings.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-charcoal-100/30 flex items-center justify-end gap-3">
              <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md" loading={saving}>
                <Check size={16} /> {editingRecordId ? 'Update Record' : 'Save Record'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* ── Modal: Delete Confirmation ──────────────────────────────────── */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Energy Record"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-charcoal-300">
              Are you sure you want to delete the energy record for{' '}
              <strong className="text-charcoal">{deleteTarget?.building}</strong> on{' '}
              <strong className="text-charcoal">{formatDate(deleteTarget?.log_date)}</strong>?
            </p>
            <p className="text-xs text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100">
              ⚠️ This will remove this entry from tracking totals and historical calculations.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" loading={deleting} onClick={handleDeleteConfirm}>
                Delete Record
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

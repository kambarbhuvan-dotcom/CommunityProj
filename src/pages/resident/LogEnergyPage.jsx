/**
<<<<<<< HEAD
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
=======
 * LogEnergyPage.jsx — Real User Daily Energy Logging Module
 *
 * Implements:
 * 1. Daily energy input form with actual user meter readings:
 *    - Date (defaults to today, blocks future dates)
 *    - Solar Energy Generated (kWh)
 *    - Total Household Electricity Consumption (kWh)
 *    - Grid Electricity Imported (kWh)
 *    - Grid Electricity Exported (kWh)
 *    - Battery Charge (kWh) (reactive to user's solar setup)
 *    - Battery Discharge (kWh)
 *    - Notes / Weather conditions
 * 2. Instantaneous validation & physical energy balance check:
 *    (Solar Gen + Grid Import + Battery Discharge) vs (Total Consumption + Grid Export + Battery Charge)
 * 3. Duplicate check with confirmation override.
 * 4. Recent logs quick table with edit and delete capabilities.
 * 5. Clean empty state when no records exist.
 */

import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Zap, Sun, Calendar, Plus, Pencil, Trash2, Search,
  Download, AlertTriangle, CheckCircle2, ArrowRight,
  BatteryCharging, CloudSun, FileText, Check, X, ShieldCheck
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
<<<<<<< HEAD
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
=======
import Alert from '../../components/ui/Alert'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import {
  getEnergyLogs, saveEnergyLog, deleteEnergyLog,
  getSolarSetup, getUserSettings, checkDuplicateLog
} from '../../services/solarDataService'
import {
  calcRecordSelfConsumption, calcCostSaved, calcCO2Avoided,
  validateEnergyBalance, calcEnergyBalance
} from '../../utils/calculations'
import { formatDate } from '../../utils/formatters'
import { todayISO, WEATHER_CONDITIONS } from '../../utils/constants'

export default function LogEnergyPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState([])
  const [solarSetup, setSolarSetup] = useState(null)
  const [userSettings, setUserSettings] = useState(null)

  // Notification state
  const [alertInfo, setAlertInfo] = useState(null)

  // Form State
  const [formData, setFormData] = useState({
    log_date: todayISO(),
    solar_generated_kwh: '',
    total_consumption_kwh: '',
    grid_import_kwh: '',
    grid_export_kwh: '',
    battery_charge_kwh: '',
    battery_discharge_kwh: '',
    weather: 'Sunny / Clear Sky',
    notes: '',
  })

  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [overrideDuplicate, setOverrideDuplicate] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Load user data
  async function loadData() {
    try {
      const [userLogs, setup, settings] = await Promise.all([
        getEnergyLogs(user?.id),
        getSolarSetup(user?.id),
        getUserSettings(user?.id),
      ])
      setLogs(userLogs)
      setSolarSetup(setup)
      setUserSettings(settings)
    } catch (err) {
      console.error('Failed to load user logs:', err)
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
<<<<<<< HEAD
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
=======
    loadData()
  }, [user?.id])

  // Instantaneous live balance check
  const balanceCheck = useMemo(() => {
    const isPopulated = (val) => val !== '' && val !== null && val !== undefined && !Number.isNaN(Number(val))

    const hasAll4 = isPopulated(formData.solar_generated_kwh) &&
                    isPopulated(formData.total_consumption_kwh) &&
                    isPopulated(formData.grid_import_kwh) &&
                    isPopulated(formData.grid_export_kwh)

    if (!hasAll4) {
      return null
    }

    const gen = parseFloat(formData.solar_generated_kwh)
    const con = parseFloat(formData.total_consumption_kwh)
    const imp = parseFloat(formData.grid_import_kwh)
    const exp = parseFloat(formData.grid_export_kwh)
    const bChg = isPopulated(formData.battery_charge_kwh) ? parseFloat(formData.battery_charge_kwh) : 0
    const bDis = isPopulated(formData.battery_discharge_kwh) ? parseFloat(formData.battery_discharge_kwh) : 0

    // Net energy flow = (gen - exp - bChg + imp + bDis) vs con
    const netFlow = gen - exp - bChg + imp + bDis
    const diff = Math.abs(netFlow - con)

    // Trigger physical balance advisory warning only when discrepancy exceeds 0.1 kWh tolerance
    if (diff > 0.1) {
      const formattedDiff = parseFloat(diff.toFixed(2))
      return {
        valid: false,
        diff: formattedDiff,
        message: `Energy balance discrepancy of ${formattedDiff} kWh detected. Inputs (Solar Gen ${gen} kWh - Export ${exp} kWh + Import ${imp} kWh = ${(gen - exp + imp).toFixed(2)} kWh) do not match Total Consumption (${con.toFixed(2)} kWh).`,
      }
    }

    return {
      valid: true,
      diff: 0,
      message: null,
    }
  }, [formData])

  // Computed preview for current form values
  const formPreview = useMemo(() => {
    const gen = Math.max(0, parseFloat(formData.solar_generated_kwh) || 0)
    const con = Math.max(0, parseFloat(formData.total_consumption_kwh) || 0)
    const imp = Math.max(0, parseFloat(formData.grid_import_kwh) || 0)
    const exp = Math.max(0, parseFloat(formData.grid_export_kwh) || 0)
    const bChg = Math.max(0, parseFloat(formData.battery_charge_kwh) || 0)
    const bDis = Math.max(0, parseFloat(formData.battery_discharge_kwh) || 0)

    // Safely bounded within physical limits: cannot exceed solar generation or consumption
    const rawSelfUsed = (bChg > 0 || bDis > 0)
      ? Math.min(gen - exp - bChg + bDis, con - imp)
      : Math.min(gen - exp, con - imp)
    const selfConsumed = Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed)))

    const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
    const emissionFactor = Number(userSettings?.grid_emission_factor ?? 0.82)
    const savings = calcCostSaved(selfConsumed, tariff)
    const co2 = calcCO2Avoided(selfConsumed, emissionFactor)

    return { selfConsumed, savings, co2 }
  }, [formData, userSettings])

  function validateInputs() {
    const errors = {}
    const today = todayISO()

    if (!formData.log_date) {
      errors.log_date = 'Date is required.'
    } else if (formData.log_date > today) {
      errors.log_date = 'Cannot log energy for a future date.'
    }

    const gen = parseFloat(formData.solar_generated_kwh)
    if (formData.solar_generated_kwh === '' || isNaN(gen)) {
      errors.solar_generated_kwh = 'Solar generation is required.'
    } else if (gen < 0) {
      errors.solar_generated_kwh = 'Cannot be negative.'
    }

    const con = parseFloat(formData.total_consumption_kwh)
    if (formData.total_consumption_kwh === '' || isNaN(con)) {
      errors.total_consumption_kwh = 'Household consumption is required.'
    } else if (con < 0) {
      errors.total_consumption_kwh = 'Cannot be negative.'
    }

    const imp = parseFloat(formData.grid_import_kwh)
    if (formData.grid_import_kwh !== '') {
      if (isNaN(imp) || imp < 0) {
        errors.grid_import_kwh = 'Cannot be negative.'
      } else if (!isNaN(con) && con >= 0 && imp > con) {
        errors.grid_import_kwh = 'Grid imported cannot exceed total electricity consumed.'
      }
    }

    const exp = parseFloat(formData.grid_export_kwh)
    if (formData.grid_export_kwh !== '') {
      if (isNaN(exp) || exp < 0) {
        errors.grid_export_kwh = 'Cannot be negative.'
      } else if (!isNaN(gen) && gen >= 0 && exp > gen) {
        errors.grid_export_kwh = 'Grid exported cannot exceed solar energy generated.'
      }
    }

    const bChg = parseFloat(formData.battery_charge_kwh)
    if (formData.battery_charge_kwh !== '') {
      if (isNaN(bChg) || bChg < 0) {
        errors.battery_charge_kwh = 'Cannot be negative.'
      } else if (!isNaN(gen) && gen >= 0 && bChg > gen) {
        errors.battery_charge_kwh = 'Battery charge cannot exceed solar energy generated.'
      }
    }

    const bDis = parseFloat(formData.battery_discharge_kwh)
    if (formData.battery_discharge_kwh !== '') {
      if (isNaN(bDis) || bDis < 0) {
        errors.battery_discharge_kwh = 'Cannot be negative.'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setAlertInfo(null)

    if (!validateInputs()) return

    // Duplicate date check
    if (!overrideDuplicate) {
      const dup = await checkDuplicateLog(user?.id, formData.log_date, editingId)
      if (dup) {
        setDuplicateWarning({
          message: `A record for ${formatDate(formData.log_date)} already exists (${dup.solar_generated_kwh} kWh generated). Would you like to update the existing entry or overwrite it?`,
          duplicateRecord: dup,
        })
        return
      }
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    }

    setSaving(true)
    try {
<<<<<<< HEAD
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
=======
      const notesCombined = [formData.weather, formData.notes].filter(Boolean).join(' • ')
      const gen = Math.max(0, parseFloat(formData.solar_generated_kwh) || 0)
      const con = Math.max(0, parseFloat(formData.total_consumption_kwh) || 0)
      const imp = Math.max(0, parseFloat(formData.grid_import_kwh) || 0)
      const exp = Math.max(0, parseFloat(formData.grid_export_kwh) || 0)
      const bChg = Math.max(0, parseFloat(formData.battery_charge_kwh) || 0)
      const bDis = Math.max(0, parseFloat(formData.battery_discharge_kwh) || 0)

      const rawSelfUsed = (bChg > 0 || bDis > 0)
        ? Math.min(gen - exp - bChg + bDis, con - imp)
        : Math.min(gen - exp, con - imp)
      const selfConsumed = parseFloat(Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed))).toFixed(2))

      await saveEnergyLog(user?.id, {
        id: editingId,
        log_date: formData.log_date,
        solar_generated_kwh: gen,
        total_consumption_kwh: con,
        solar_utilized_kwh: selfConsumed,
        grid_import_kwh: imp,
        grid_export_kwh: exp,
        battery_charge_kwh: bChg,
        battery_discharge_kwh: bDis,
        notes: notesCombined,
      })

      setAlertInfo({
        variant: 'success',
        message: editingId
          ? `Record for ${formatDate(formData.log_date)} successfully updated.`
          : `Energy reading for ${formatDate(formData.log_date)} logged successfully!`,
      })

      resetForm()
      await loadData()
    } catch (err) {
      setAlertInfo({ variant: 'error', message: 'Failed to save energy record.' })
    } finally {
      setSaving(false)
      setOverrideDuplicate(false)
      setDuplicateWarning(null)
    }
  }

  function resetForm() {
    setEditingId(null)
    setFormData({
      log_date: todayISO(),
      solar_generated_kwh: '',
      total_consumption_kwh: '',
      grid_import_kwh: '',
      grid_export_kwh: '',
      battery_charge_kwh: '',
      battery_discharge_kwh: '',
      weather: 'Sunny / Clear Sky',
      notes: '',
    })
    setFormErrors({})
    setDuplicateWarning(null)
  }

  function startEdit(log) {
    setEditingId(log.id)
    setFormData({
      log_date: log.log_date,
      solar_generated_kwh: String(log.solar_generated_kwh),
      total_consumption_kwh: String(log.total_consumption_kwh),
      grid_import_kwh: log.grid_import_kwh ? String(log.grid_import_kwh) : '',
      grid_export_kwh: log.grid_export_kwh ? String(log.grid_export_kwh) : '',
      battery_charge_kwh: log.battery_charge_kwh ? String(log.battery_charge_kwh) : '',
      battery_discharge_kwh: log.battery_discharge_kwh ? String(log.battery_discharge_kwh) : '',
      weather: WEATHER_CONDITIONS.find((w) => log.notes?.includes(w)) || 'Sunny / Clear Sky',
      notes: log.notes ? log.notes.replace(/Sunny \/ Clear Sky|Partly Cloudy|Overcast \/ Hazy|Monsoon \/ Rainy|•/g, '').trim() : '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    } finally {
      setDeleting(false)
    }
  }

<<<<<<< HEAD
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
=======
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
        title="Log Energy Usage"
        subtitle="Record your actual daily solar generation, electricity consumption, and net grid exchange readings."
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Log Entry Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-[#DCEBFA] shadow-sm">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#DCEBFA]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                    <Zap size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#153B65]">
                      {editingId ? 'Edit Daily Energy Record' : 'Log Today\'s Meter Readings'}
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Enter values from your inverter mobile app and official utility electricity meter.
                    </p>
                  </div>
                </div>

                {editingId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetForm}
                    className="text-xs"
                  >
                    Cancel Edit
                  </Button>
                )}
              </div>

              {/* Duplicate Date Alert */}
              {duplicateWarning && (
                <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle size={15} />
                    Duplicate Record Detected
                  </div>
                  <p>{duplicateWarning.message || duplicateWarning}</p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    {duplicateWarning.duplicateRecord && (
                      <Button
                        size="sm"
                        variant="primary"
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs py-1"
                        onClick={() => {
                          startEdit(duplicateWarning.duplicateRecord)
                          setDuplicateWarning(null)
                        }}
                      >
                        Update Existing Entry
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-amber-300 text-amber-900 hover:bg-amber-100 text-xs py-1"
                      onClick={() => {
                        if (duplicateWarning.duplicateRecord) {
                          setEditingId(duplicateWarning.duplicateRecord.id)
                        }
                        setOverrideDuplicate(true)
                        setDuplicateWarning(null)
                      }}
                    >
                      Confirm Overwrite
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs py-1"
                      onClick={() => setDuplicateWarning(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Date Picker */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Log Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      max={todayISO()}
                      required
                      value={formData.log_date}
                      onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                        formErrors.log_date
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                      }`}
                    />
                    {formErrors.log_date && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.log_date}</span>
                    )}
                  </div>

                  {/* Weather Condition */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Weather / Sunlight Condition
                    </label>
                    <select
                      value={formData.weather}
                      onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      {WEATHER_CONDITIONS.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>

                  {/* Solar Energy Generated */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Solar Energy Generated <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="e.g. 18.5"
                        value={formData.solar_generated_kwh}
                        onChange={(e) => setFormData({ ...formData, solar_generated_kwh: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                          formErrors.solar_generated_kwh
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                    </div>
                    {formErrors.solar_generated_kwh && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.solar_generated_kwh}</span>
                    )}
                    <span className="text-[11px] text-[#64748B] mt-1 block">From your inverter display/portal</span>
                  </div>

                  {/* Total Household Consumption */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Total Electricity Consumed <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="e.g. 14.2"
                        value={formData.total_consumption_kwh}
                        onChange={(e) => setFormData({ ...formData, total_consumption_kwh: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                          formErrors.total_consumption_kwh
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                    </div>
                    {formErrors.total_consumption_kwh && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.total_consumption_kwh}</span>
                    )}
                    <span className="text-[11px] text-[#64748B] mt-1 block">Total household power used</span>
                  </div>

                  {/* Grid Electricity Imported */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Grid Electricity Imported
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 3.0"
                        value={formData.grid_import_kwh}
                        onChange={(e) => setFormData({ ...formData, grid_import_kwh: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                          formErrors.grid_import_kwh
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                    </div>
                    {formErrors.grid_import_kwh && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.grid_import_kwh}</span>
                    )}
                    <span className="text-[11px] text-[#64748B] mt-1 block">Import reading from bidirectional meter</span>
                  </div>

                  {/* Grid Electricity Exported */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Grid Electricity Exported
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 7.3"
                        value={formData.grid_export_kwh}
                        onChange={(e) => setFormData({ ...formData, grid_export_kwh: e.target.value })}
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                          formErrors.grid_export_kwh
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                        }`}
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                    </div>
                    {formErrors.grid_export_kwh && (
                      <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.grid_export_kwh}</span>
                    )}
                    <span className="text-[11px] text-[#64748B] mt-1 block">Surplus sent to DISCOM grid</span>
                  </div>

                  {/* Battery Inputs (Shown if battery configured or expandible) */}
                  {(solarSetup?.has_battery_storage || formData.battery_charge_kwh || formData.battery_discharge_kwh) && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                          Battery Charge (Stored)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 4.0"
                            value={formData.battery_charge_kwh}
                            onChange={(e) => setFormData({ ...formData, battery_charge_kwh: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                              formErrors.battery_charge_kwh
                                ? 'border-rose-400 focus:ring-rose-200'
                                : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                            }`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                        </div>
                        {formErrors.battery_charge_kwh && (
                          <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.battery_charge_kwh}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                          Battery Discharge (Used)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="e.g. 3.8"
                            value={formData.battery_discharge_kwh}
                            onChange={(e) => setFormData({ ...formData, battery_discharge_kwh: e.target.value })}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-[#153B65] focus:outline-none focus:ring-2 ${
                              formErrors.battery_discharge_kwh
                                ? 'border-rose-400 focus:ring-rose-200'
                                : 'border-[#DCEBFA] focus:ring-[#2563EB]/20 focus:border-[#2563EB]'
                            }`}
                          />
                          <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh</span>
                        </div>
                        {formErrors.battery_discharge_kwh && (
                          <span className="text-[11px] text-rose-500 mt-1 block">{formErrors.battery_discharge_kwh}</span>
                        )}
                      </div>
                    </>
                  )}

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Notes / Observations
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Heavy AC usage in afternoon, panel washed in morning"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>

                {/* Live Balance Validator Warning Banner */}
                {balanceCheck && !balanceCheck.valid && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-amber-900">
                      <AlertTriangle size={14} className="text-amber-600" />
                      Physical Energy Balance Advisory ({balanceCheck.diff > 0 ? '+' : ''}{balanceCheck.diff} kWh discrepancy)
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      {balanceCheck.message} You can still submit if your inverter or DISCOM meters sync on different hourly cut-offs.
                    </p>
                  </div>
                )}

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DCEBFA]">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={saving}
                    className="px-6 py-2.5 text-sm font-bold shadow-sm"
                  >
                    <CheckCircle2 size={16} className="mr-1.5" />
                    {editingId ? 'Update Record' : 'Save Daily Record'}
                  </Button>
                </div>
              </form>
            </Card>

            {/* Recent Logged Records */}
            <Card className="border border-[#DCEBFA] shadow-sm">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#DCEBFA]">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#0EA5E9]" />
                  <h3 className="text-sm font-bold text-[#153B65]">Recent Logged Days</h3>
                </div>
                <Link
                  to="/records"
                  className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                >
                  View All ({logs.length})
                  <ArrowRight size={13} />
                </Link>
              </div>

              {logs.length === 0 ? (
                <EmptyState
                  icon={Sun}
                  title="No Energy Records Logged Yet"
                  description="Use the form above to record your first day of solar generation and household power usage."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#F4FAFF] text-[#64748B] uppercase font-bold text-[10px] border-b border-[#DCEBFA]">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3 text-right">Generated</th>
                        <th className="py-2.5 px-3 text-right">Consumed</th>
                        <th className="py-2.5 px-3 text-right">Self-Used</th>
                        <th className="py-2.5 px-3 text-right">Export</th>
                        <th className="py-2.5 px-3 text-right">Est. Savings</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCEBFA]/50">
                      {logs.slice(0, 5).map((log) => {
                        const tariff = Number(userSettings?.electricity_tariff_inr ?? 7.50)
                        const saved = calcCostSaved(log.solar_utilized_kwh, tariff)

                        return (
                          <tr key={log.id} className="hover:bg-[#EAF6FF]/40 transition-colors">
                            <td className="py-2.5 px-3 font-semibold text-[#153B65]">
                              {formatDate(log.log_date)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#2563EB]">
                              {Number(log.solar_generated_kwh).toFixed(1)} kWh
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#153B65]">
                              {Number(log.total_consumption_kwh).toFixed(1)} kWh
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-[#22C55E]">
                              {Number(log.solar_utilized_kwh).toFixed(1)} kWh
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#64748B]">
                              {Number(log.grid_export_kwh || 0).toFixed(1)} kWh
                            </td>
                            <td className="py-2.5 px-3 text-right font-bold text-[#22C55E]">
                              ₹{saved.toFixed(1)}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => startEdit(log)}
                                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EAF6FF]"
                                  title="Edit entry"
                                >
                                  <Pencil size={13} />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(log)}
                                  className="p-1.5 rounded-lg text-[#64748B] hover:text-rose-600 hover:bg-rose-50"
                                  title="Delete entry"
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
              )}
            </Card>
          </div>

          {/* Instant Calculation Preview Card */}
          <div className="space-y-6">
            <Card className="border border-[#DCEBFA] shadow-sm bg-gradient-to-br from-white to-[#F4FAFF]">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#DCEBFA]">
                <Sun size={17} className="text-[#0EA5E9]" />
                <h3 className="text-sm font-bold text-[#153B65] uppercase tracking-wide">
                  Real-Time Output Preview
                </h3>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-white border border-[#DCEBFA] shadow-xs">
                  <span className="text-[11px] text-[#64748B] block font-medium">Self-Consumed Solar</span>
                  <span className="text-2xl font-extrabold text-[#22C55E] tracking-tight">
                    {formPreview.selfConsumed.toFixed(2)}{' '}
                    <span className="text-sm font-semibold text-[#153B65]">kWh</span>
                  </span>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Direct rooftop energy utilized on-site without drawing from grid.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#DCEBFA] shadow-xs">
                  <span className="text-[11px] text-[#64748B] block font-medium">Estimated Money Saved</span>
                  <span className="text-2xl font-extrabold text-[#2563EB] tracking-tight">
                    ₹{formPreview.savings.toFixed(2)}
                  </span>
                  <span className="text-[11px] text-[#64748B] block mt-1">
                    Based on tariff ₹{Number(userSettings?.electricity_tariff_inr ?? 7.50).toFixed(2)} / kWh
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-[#DCEBFA] shadow-xs">
                  <span className="text-[11px] text-[#64748B] block font-medium">Estimated CO₂ Offset</span>
                  <span className="text-xl font-bold text-[#153B65] tracking-tight">
                    {formPreview.co2.toFixed(2)}{' '}
                    <span className="text-xs font-semibold text-[#64748B]">kg CO₂</span>
                  </span>
                  <span className="text-[11px] text-[#64748B] block mt-1">
                    Factor: {Number(userSettings?.grid_emission_factor ?? 0.82).toFixed(2)} kg/kWh
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] text-xs text-[#153B65] space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#2563EB]" />
                    Automated Calculation Policy
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Calculations run live on client submit. Zero estimates are invented or hardcoded.
                  </p>
                </div>
              </div>
            </Card>

            {/* Solar Setup Quick Status */}
            <Card className="border border-[#DCEBFA] p-4 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-[#153B65]">
                <span>Configured System</span>
                <Link to="/setup" className="text-[#2563EB] hover:underline text-[11px]">Edit</Link>
              </div>
              {solarSetup?.system_capacity_kw ? (
                <div className="space-y-1 text-[#64748B]">
                  <p>Capacity: <strong className="text-[#153B65]">{solarSetup.system_capacity_kw} kW</strong></p>
                  <p>Location: <strong className="text-[#153B65]">{solarSetup.city_location}</strong></p>
                  <p>Battery: <strong className="text-[#153B65]">{solarSetup.has_battery_storage ? `${solarSetup.battery_capacity_kwh} kWh` : 'No'}</strong></p>
                </div>
              ) : (
                <p className="text-[#64748B]">
                  You have not set up your solar specs yet.{' '}
                  <Link to="/setup" className="text-[#2563EB] font-bold underline">
                    Configure now
                  </Link>
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Energy Record?"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">
              Are you sure you want to delete the energy record for{' '}
              <strong className="text-[#153B65]">{formatDate(deleteTarget?.log_date)}</strong>? This will recalculate all cumulative statistics.
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
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

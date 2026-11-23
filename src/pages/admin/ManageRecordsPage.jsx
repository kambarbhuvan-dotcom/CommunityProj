/**
 * ManageRecordsPage.jsx — Admin: Energy Records Master Audit & Management
 *
 * Implements:
 * 1. View all energy records across all community buildings and units
 * 2. Filter records by Building and by Date Range (All, Today, Last 7 Days, Last 30 Days, This Month)
 * 3. Search by building/unit or notes
 * 4. Add new energy records with strict validation
 * 5. Edit existing energy records
 * 6. Delete incorrect or duplicate records with confirmation
 * 7. Clear DEMO vs LIVE record visual indicators
 * 8. Summary statistics bar (Total records, Total Gen kWh, Total Utilized, Net Balance)
 * 9. CSV Data Export
 */

import { useState, useEffect } from 'react'
import {
  Download, Plus, Pencil, Trash2, ShieldCheck, Filter,
  Search, CheckCircle2, AlertCircle, AlertTriangle, X,
  FileSpreadsheet, Zap, Sun, Leaf
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../utils/formatters'
import { calcNetEnergy, calcCostSaved, calcCO2Avoided } from '../../utils/calculations'
import {
  getAllRecords, saveRecord, deleteRecord, getCommunityList,
  calculateRecordTotals
} from '../../services/energyStorageService'
import { todayISO } from '../../utils/constants'

const emptyRecordForm = {
  log_date: todayISO(),
  building: 'Sunrise Apartments Block A',
  solar_generated_kwh: '',
  consumption_kwh: '',
  solar_utilized_kwh: '',
  notes: '',
  is_demo: false,
}

export default function ManageRecordsPage() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [communities, setCommunities] = useState([])

  // Filters & Search
  const [search, setSearch] = useState('')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all') // 'all' | 'today' | '7days' | '30days' | 'this_month'

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(emptyRecordForm)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg, isError = false) {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage((curr) => (curr?.text === msg ? null : curr)), 3500)
  }

  async function loadData() {
    setLoading(true)
    try {
      const data = await getAllRecords()
      setRecords(data)
      setCommunities(getCommunityList())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openAddModal() {
    setIsEditing(false)
    setFormData({
      ...emptyRecordForm,
      log_date: todayISO(),
      building: communities[0] || 'Sunrise Apartments Block A',
    })
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(record) {
    setIsEditing(true)
    setFormData({
      id: record.id,
      log_date: record.log_date,
      building: record.building || communities[0] || 'Sunrise Apartments Block A',
      solar_generated_kwh: record.solar_generated_kwh,
      consumption_kwh: record.consumption_kwh,
      solar_utilized_kwh: record.solar_utilized_kwh,
      notes: record.notes || '',
      is_demo: Boolean(record.is_demo),
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSaveRecord(e) {
    e.preventDefault()
    const gen = parseFloat(formData.solar_generated_kwh)
    const con = parseFloat(formData.consumption_kwh)
    const uti = parseFloat(formData.solar_utilized_kwh)

    // Strict validation
    if (isNaN(gen) || gen < 0) {
      setFormError('Solar generation must be a non-negative number.')
      return
    }
    if (isNaN(con) || con < 0) {
      setFormError('Electricity consumption must be a non-negative number.')
      return
    }
    if (isNaN(uti) || uti < 0) {
      setFormError('Solar utilization must be a non-negative number.')
      return
    }
    if (uti > gen) {
      setFormError('Solar utilized cannot exceed solar generated.')
      return
    }
    if (uti > con) {
      setFormError('Solar utilized cannot exceed total electricity consumed.')
      return
    }

    try {
      await saveRecord({
        ...formData,
        solar_generated_kwh: gen,
        consumption_kwh: con,
        solar_utilized_kwh: uti,
      })
      showToast(isEditing ? 'Record updated successfully.' : 'New energy record created.')
      setShowModal(false)
      loadData()
    } catch (err) {
      setFormError(err.message || 'Failed to save record.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteRecord(deleteTarget.id)
      showToast(`Record for ${formatDate(deleteTarget.log_date)} deleted.`)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to delete record.', true)
    }
  }

  // ─── Filter Logic ──────────────────────────────────────────────────────────
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const currentMonthPrefix = todayStr.substring(0, 7) // 'YYYY-MM'

  const filteredRecords = records.filter((r) => {
    // Search filter
    const matchesSearch =
      r.building?.toLowerCase().includes(search.toLowerCase()) ||
      r.notes?.toLowerCase().includes(search.toLowerCase()) ||
      r.log_date.includes(search)

    // Building filter
    const matchesBuilding = buildingFilter === 'all' || r.building === buildingFilter

    // Date filter
    let matchesDate = true
    if (dateFilter === 'today') {
      matchesDate = r.log_date === todayStr
    } else if (dateFilter === '7days') {
      const d = new Date(r.log_date)
      const diffDays = (now - d) / (1000 * 60 * 60 * 24)
      matchesDate = diffDays >= 0 && diffDays <= 7
    } else if (dateFilter === '30days') {
      const d = new Date(r.log_date)
      const diffDays = (now - d) / (1000 * 60 * 60 * 24)
      matchesDate = diffDays >= 0 && diffDays <= 30
    } else if (dateFilter === 'this_month') {
      matchesDate = r.log_date.startsWith(currentMonthPrefix)
    }

    return matchesSearch && matchesBuilding && matchesDate
  })

  const totals = calculateRecordTotals(filteredRecords)

  // ─── CSV Export ────────────────────────────────────────────────────────────
  function exportCSV() {
    const headers = 'ID,Building,Date,Solar_Generated_kWh,Solar_Utilized_kWh,Consumption_kWh,Net_Balance_kWh,Savings_INR,CO2_Reduction_kg,Is_Demo,Notes\n'
    const rows = filteredRecords.map((r) => {
      const net = calcNetEnergy(r.solar_generated_kwh, r.consumption_kwh)
      const saved = calcCostSaved(r.solar_utilized_kwh)
      const co2 = calcCO2Avoided(r.solar_generated_kwh)
      return `"${r.id}","${r.building || ''}","${r.log_date}",${r.solar_generated_kwh},${r.solar_utilized_kwh},${r.consumption_kwh},${net.toFixed(2)},${saved.toFixed(2)},${co2.toFixed(2)},${Boolean(r.is_demo)},"${(r.notes || '').replace(/"/g, '""')}"`
    }).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `solarconnect-audit-records-${todayStr}.csv`
    link.click()
  }

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Energy Records"
        subtitle="Master audit of all household and community rooftop energy entries. Filter, inspect, correct, or export."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="secondary" size="sm" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={openAddModal}>
              <Plus size={14} /> Add Record
            </Button>
          </div>
        }
      >
        {/* Toast */}
        {toastMessage && (
          <div
            className={`mb-4 p-3 rounded-xl border text-sm flex items-center justify-between shadow-sm animate-fade-in ${
              toastMessage.isError
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-forest-50 border-forest-200 text-forest'
            }`}
          >
            <div className="flex items-center gap-2">
              {toastMessage.isError ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="hover:opacity-75">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Live Filter Totals Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Filtered Records</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{totals.count}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Solar Generation</p>
            <p className="text-xl font-bold text-forest mt-0.5">{totals.totalGen} kWh</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Solar Utilized</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{totals.totalUtilized} kWh</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Estimated Savings</p>
            <p className="text-xl font-bold text-solar-600 mt-0.5">₹{totals.savings.toLocaleString()}</p>
          </Card>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 items-stretch md:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
            <input
              type="text"
              placeholder="Search by building, date, or notes…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs py-2 w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/* Building Filter */}
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="all">All Buildings</option>
              {communities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Date Range Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="this_month">This Month</option>
            </select>
          </div>
        </div>

        {/* Records Table */}
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Building / Unit</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Log Date</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Generated</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Utilized</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Consumed</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Net Balance</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Savings</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-charcoal-300 text-sm">
                      No energy records match your search and filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((log) => {
                    const net = calcNetEnergy(log.solar_generated_kwh, log.consumption_kwh)
                    const saved = calcCostSaved(log.solar_utilized_kwh)
                    return (
                      <tr key={log.id} className="hover:bg-charcoal-100/10 transition-colors">
                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-charcoal text-xs">{log.building || 'Community Unit'}</p>
                          {log.notes && (
                            <p className="text-[11px] text-charcoal-300 line-clamp-1 italic mt-0.5">{log.notes}</p>
                          )}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-charcoal-300 font-mono">
                          {formatDate(log.log_date)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-forest font-semibold">
                          {log.solar_generated_kwh} kWh
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-charcoal-400">
                          {log.solar_utilized_kwh} kWh
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-charcoal-400">
                          {log.consumption_kwh} kWh
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs font-semibold">
                          <span className={net >= 0 ? 'text-forest' : 'text-red-500'}>
                            {net >= 0 ? `+${net.toFixed(1)}` : net.toFixed(1)} kWh
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-solar-600 font-medium">
                          ₹{saved.toFixed(0)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {log.is_demo ? (
                            <Badge variant="demo">DEMO</Badge>
                          ) : (
                            <Badge variant="success">LIVE</Badge>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(log)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit record"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(log)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-600 hover:bg-red-50 transition-colors"
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
        </Card>

        {/* Modal: Add / Edit Record */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? 'Edit Energy Record' : 'Add New Energy Record'}
          size="md"
        >
          <form onSubmit={handleSaveRecord} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Log Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.log_date}
                  onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Building / Community *</label>
                <select
                  className="form-input"
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                >
                  {communities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">Generated (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 18.5"
                  value={formData.solar_generated_kwh}
                  onChange={(e) => setFormData({ ...formData, solar_generated_kwh: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Consumed (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 14.2"
                  value={formData.consumption_kwh}
                  onChange={(e) => setFormData({ ...formData, consumption_kwh: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Utilized (kWh) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 12.0"
                  value={formData.solar_utilized_kwh}
                  onChange={(e) => setFormData({ ...formData, solar_utilized_kwh: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Notes & Audit Remarks (Optional)</label>
              <textarea
                rows={2}
                className="form-input resize-none"
                placeholder="Inverter inspection notes, weather remarks, or verification details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 accent-forest"
                checked={formData.is_demo}
                onChange={(e) => setFormData({ ...formData, is_demo: e.target.checked })}
              />
              <span className="text-xs text-charcoal">
                Mark as simulated / demo measurement record
              </span>
            </label>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Changes' : 'Record Entry'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Record */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Energy Record"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                Delete record for <strong>{deleteTarget?.building}</strong> on <strong>{deleteTarget && formatDate(deleteTarget.log_date)}</strong>?
                This will recalculate all community totals.
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

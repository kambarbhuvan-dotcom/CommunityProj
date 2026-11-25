/**
 * MyRecordsPage.jsx — Personal Energy Log History & Management
 *
 * Implements:
 * 1. Filterable & Paginated Table of personal energy records
 * 2. Real-time Search by date, notes, or building
 * 3. In-line Edit Modal with strict numeric validation
 * 4. Delete Confirmation Modal with live recalculation
 * 5. CSV Data Export
 */

import { useState, useEffect, useMemo } from 'react'
import { Download, Pencil, Trash2, Plus, Calendar, Search, AlertCircle, CheckCircle2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
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
    notes: '',
  })
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
  }

  useEffect(() => {
    loadData()
  }, [])

  function openEditModal(log) {
    setEditTarget(log)
    setEditForm({
      solar_generated_kwh: log.solar_generated_kwh,
      consumption_kwh: log.consumption_kwh,
      solar_utilized_kwh: log.solar_utilized_kwh,
      notes: log.notes || '',
    })
    setEditError('')
  }

  async function handleSaveEdit(e) {
    e.preventDefault()
    const gen = parseFloat(editForm.solar_generated_kwh)
    const con = parseFloat(editForm.consumption_kwh)
    const uti = parseFloat(editForm.solar_utilized_kwh)

    if (isNaN(gen) || gen < 0) {
      setEditError('Solar generation must be a non-negative number.')
      return
    }
    if (isNaN(con) || con < 0) {
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
    } catch (err) {
      setEditError(err.message || 'Failed to update record.')
    } finally {
      setSavingEdit(false)
    }
  }

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

  return (
    <AppLayout>
      <PageWrapper
        title="My Energy Records"
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
            </div>
          )}
        </Card>

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
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

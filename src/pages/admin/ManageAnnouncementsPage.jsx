/**
 * ManageAnnouncementsPage.jsx — Admin: Community Announcements Management
 *
 * Implements:
 * 1. View all announcements with category, pinned status, and publish date
 * 2. Create new announcements with category, highlight, and optional pin
 * 3. Edit existing announcements
 * 4. Remove announcements with confirmation modal
 * 5. Toggle pinned status
 * 6. Search announcements
 */

import { useState, useEffect } from 'react'
import {
  Plus, Pencil, Trash2, Pin, ShieldCheck, Search,
  CheckCircle2, AlertCircle, AlertTriangle, X, Megaphone,
  Bell, Tag, Calendar
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { formatDate } from '../../utils/formatters'
import { todayISO } from '../../utils/constants'
import {
  getAllAnnouncements, createAnnouncement, updateAnnouncement,
  deleteAnnouncement, togglePinAnnouncement
} from '../../services/adminService'

const ANNOUNCEMENT_CATEGORIES = [
  { value: 'Solar Awareness Campaign', type: 'campaign' },
  { value: 'Solar Installation Workshop', type: 'workshop' },
  { value: 'Energy Conservation Activity', type: 'conservation' },
  { value: 'Community Achievement', type: 'achievement' },
  { value: 'General Notice', type: 'general' },
]

const emptyAnnouncementForm = {
  title: '',
  category: 'Solar Awareness Campaign',
  summary: '',
  highlight: '',
  published_at: todayISO(),
  is_pinned: false,
}

export default function ManageAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(emptyAnnouncementForm)
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
      const data = await getAllAnnouncements()
      setAnnouncements(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  function openCreateModal() {
    setIsEditing(false)
    setFormData({
      ...emptyAnnouncementForm,
      published_at: todayISO(),
    })
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(ann) {
    setIsEditing(true)
    setFormData({
      id: ann.id,
      title: ann.title,
      category: ann.category || 'General Notice',
      summary: ann.summary || ann.body || '',
      highlight: ann.highlight || '',
      published_at: ann.published_at || ann.date || todayISO(),
      is_pinned: Boolean(ann.is_pinned),
    })
    setFormError('')
    setShowModal(true)
  }

  async function handleSaveAnnouncement(e) {
    e.preventDefault()
    if (!formData.title?.trim()) {
      setFormError('Announcement title is required.')
      return
    }
    if (!formData.summary?.trim()) {
      setFormError('Announcement summary/body is required.')
      return
    }

    const catObj = ANNOUNCEMENT_CATEGORIES.find((c) => c.value === formData.category)

    try {
      if (isEditing) {
        await updateAnnouncement(formData.id, {
          ...formData,
          type: catObj?.type || 'campaign',
        })
        showToast(`Updated announcement "${formData.title}".`)
      } else {
        await createAnnouncement({
          ...formData,
          type: catObj?.type || 'campaign',
        })
        showToast(`Posted new announcement: "${formData.title}".`)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      setFormError(err.message || 'Failed to save announcement.')
    }
  }

  async function handleTogglePin(ann) {
    try {
      await togglePinAnnouncement(ann.id)
      showToast(ann.is_pinned ? 'Unpinned announcement.' : 'Pinned announcement to the top.')
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to pin.', true)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteAnnouncement(deleteTarget.id)
      showToast(`Deleted announcement "${deleteTarget.title}".`)
      setDeleteTarget(null)
      loadData()
    } catch (err) {
      showToast(err.message || 'Failed to delete announcement.', true)
    }
  }

  const filteredAnnouncements = announcements.filter((a) => {
    return (
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary?.toLowerCase().includes(search.toLowerCase()) ||
      a.category?.toLowerCase().includes(search.toLowerCase())
    )
  })

  const totalPinned = announcements.filter((a) => a.is_pinned).length

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Community Announcements"
        subtitle="Broadcast solar awareness campaigns, seasonal cleaning drives, and community milestone updates."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus size={14} /> New Announcement
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

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Total Announcements</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{announcements.length}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Pinned to Top</p>
            <p className="text-xl font-bold text-solar-600 mt-0.5">{totalPinned}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Categories Active</p>
            <p className="text-xl font-bold text-forest mt-0.5">{ANNOUNCEMENT_CATEGORIES.length}</p>
          </Card>
        </div>

        {/* Search */}
        <div className="mb-6 max-w-sm relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
          <input
            type="text"
            placeholder="Search announcements…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input pl-9 text-xs py-2 w-full"
          />
        </div>

        {/* Announcements Table */}
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Announcement</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Pinned</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {filteredAnnouncements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-charcoal-300 text-sm">
                      No announcements posted yet.
                    </td>
                  </tr>
                ) : (
                  filteredAnnouncements.map((a) => (
                    <tr key={a.id} className="hover:bg-charcoal-100/10 transition-colors">
                      <td className="px-4 py-3.5 max-w-md">
                        <div className="flex items-start gap-2">
                          {a.is_pinned && (
                            <span className="p-1 rounded bg-solar-50 text-solar-600 shrink-0 mt-0.5">
                              <Pin size={12} />
                            </span>
                          )}
                          <div>
                            <p className="font-semibold text-charcoal text-xs sm:text-sm">{a.title}</p>
                            <p className="text-[11px] text-charcoal-300 line-clamp-1 mt-0.5">
                              {a.summary || a.body}
                            </p>
                            {a.highlight && (
                              <p className="text-[10px] text-forest font-medium mt-0.5">
                                ★ {a.highlight}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-forest-50 text-forest border border-forest-200">
                          {a.category || 'Solar Notice'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {a.is_pinned ? (
                          <span className="text-xs font-semibold text-solar-600 flex items-center gap-1">
                            <Pin size={12} /> Pinned
                          </span>
                        ) : (
                          <span className="text-xs text-charcoal-200">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-charcoal-300 font-mono">
                        {formatDate(a.published_at || a.date)}
                      </td>

                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Pin */}
                          <button
                            onClick={() => handleTogglePin(a)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              a.is_pinned
                                ? 'text-solar-600 hover:bg-solar-50'
                                : 'text-charcoal-300 hover:text-solar-600 hover:bg-solar-50'
                            }`}
                            title={a.is_pinned ? 'Unpin' : 'Pin to top'}
                          >
                            <Pin size={14} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1.5 rounded-lg text-charcoal-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit announcement"
                          >
                            <Pencil size={14} />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete announcement"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Modal: Create / Edit Announcement */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? 'Edit Community Announcement' : 'Post New Community Announcement'}
          size="md"
        >
          <form onSubmit={handleSaveAnnouncement} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div>
              <label className="form-label">Announcement Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Clean Energy Week: Terrace Solar Walk & Talk"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {ANNOUNCEMENT_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.published_at}
                  onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Announcement Content *</label>
              <textarea
                rows={4}
                className="form-input resize-none"
                placeholder="Detailed information for residents regarding schedules, participation, or outcomes..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Highlight Badge Text (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Open to all residents considering rooftop installation"
                value={formData.highlight}
                onChange={(e) => setFormData({ ...formData, highlight: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 accent-forest"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
              />
              <span className="text-xs text-charcoal font-medium">
                Pin this announcement to the top of the community feed
              </span>
            </label>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Changes' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Announcement */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Announcement"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                Delete announcement <strong>&quot;{deleteTarget?.title}&quot;</strong>?
                This will be removed from all resident community boards.
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

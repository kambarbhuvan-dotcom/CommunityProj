/**
 * ManageGuidesPage.jsx — Admin: Educational Content Management
 *
 * Implements:
 * 1. List all educational solar guides with category, slug, read time, and publish status
 * 2. Add new solar guides with full metadata and body
 * 3. Edit existing articles
 * 4. Delete articles with confirmation modal
 * 5. Toggle published / draft status with immediate feedback
 * 6. Filter by category and search by title/summary
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, ShieldCheck,
  Search, BookOpen, CheckCircle2, AlertCircle, AlertTriangle, X
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import { slugify } from '../../utils/formatters'
import {
  getAllGuides, createGuide, updateGuide, deleteGuide,
  togglePublishGuide
} from '../../services/adminService'

const GUIDE_CATEGORIES = [
  { value: 'basics', label: '1. Basics & Introduction' },
  { value: 'panels', label: '2. Panel Types & Tech' },
  { value: 'installation', label: '3. Installation & Feasibility' },
  { value: 'maintenance', label: '4. Operation & Maintenance' },
  { value: 'savings', label: '5. Tariffs, Costs & Subsidies' },
  { value: 'environmental', label: '6. Environmental Impact' },
  { value: 'safety', label: '7. Electrical Safety' },
]

const emptyGuideForm = {
  title: '',
  slug: '',
  category: 'basics',
  readTime: '4 min read',
  summary: '',
  body: '',
  is_published: true,
}

export default function ManageGuidesPage() {
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Modals state
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(emptyGuideForm)
  const [formError, setFormError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg, isError = false) {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage((curr) => (curr?.text === msg ? null : curr)), 3500)
  }

  async function loadGuides() {
    setLoading(true)
    try {
      const data = await getAllGuides()
      setGuides(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadGuides()
  }, [])

  function openCreateModal() {
    setIsEditing(false)
    setFormData({ ...emptyGuideForm })
    setFormError('')
    setShowModal(true)
  }

  function openEditModal(guide) {
    setIsEditing(true)
    setFormData({
      id: guide.id,
      title: guide.title,
      slug: guide.slug,
      category: guide.category || 'basics',
      readTime: guide.readTime || '4 min read',
      summary: guide.summary || '',
      body: guide.body || '',
      is_published: Boolean(guide.is_published ?? true),
    })
    setFormError('')
    setShowModal(true)
  }

  function handleTitleChange(e) {
    const title = e.target.value
    setFormData((prev) => ({
      ...prev,
      title,
      slug: isEditing ? prev.slug : slugify(title),
    }))
  }

  async function handleSaveGuide(e) {
    e.preventDefault()
    if (!formData.title?.trim()) {
      setFormError('Guide title is required.')
      return
    }
    if (!formData.summary?.trim()) {
      setFormError('Please provide a short summary for the guide card.')
      return
    }

    try {
      if (isEditing) {
        await updateGuide(formData.id, formData)
        showToast(`Updated article: "${formData.title}".`)
      } else {
        await createGuide(formData)
        showToast(`Published new article: "${formData.title}".`)
      }
      setShowModal(false)
      loadGuides()
    } catch (err) {
      setFormError(err.message || 'Failed to save guide.')
    }
  }

  async function handleTogglePublish(guide) {
    try {
      const updated = await togglePublishGuide(guide.id)
      showToast(
        updated.is_published
          ? `Published "${guide.title}". Now visible in Learn Solar.`
          : `Moved "${guide.title}" to drafts.`
      )
      loadGuides()
    } catch (err) {
      showToast(err.message || 'Failed to toggle status.', true)
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteGuide(deleteTarget.id)
      showToast(`Deleted guide "${deleteTarget.title}".`)
      setDeleteTarget(null)
      loadGuides()
    } catch (err) {
      showToast(err.message || 'Failed to delete guide.', true)
    }
  }

  const filteredGuides = guides.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(search.toLowerCase()) ||
      g.summary?.toLowerCase().includes(search.toLowerCase()) ||
      g.category?.toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === 'all' || g.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalPublished = guides.filter((g) => g.is_published).length
  const totalDrafts = guides.filter((g) => !g.is_published).length

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Educational Content"
        subtitle="Author solar learning articles, manage official scheme guides, and publish educational resources."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus size={14} /> New Guide
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Total Articles</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{guides.length}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Published & Live</p>
            <p className="text-xl font-bold text-forest mt-0.5">{totalPublished}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Drafts / In Review</p>
            <p className="text-xl font-bold text-amber-600 mt-0.5">{totalDrafts}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Categories</p>
            <p className="text-xl font-bold text-purple-600 mt-0.5">{GUIDE_CATEGORIES.length}</p>
          </Card>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
            <input
              type="text"
              placeholder="Search guides by title or keywords…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9 text-xs py-2 w-full"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="all">All Categories</option>
              {GUIDE_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Guides Table */}
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Article Title</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Read Time</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {filteredGuides.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-charcoal-300 text-sm">
                      No educational articles found.
                    </td>
                  </tr>
                ) : (
                  filteredGuides.map((g) => {
                    const isPub = Boolean(g.is_published ?? true)
                    return (
                      <tr key={g.id} className="hover:bg-charcoal-100/10 transition-colors">
                        <td className="px-4 py-3.5 max-w-sm">
                          <p className="font-semibold text-charcoal text-xs sm:text-sm">{g.title}</p>
                          <p className="text-[11px] text-charcoal-300 line-clamp-1 mt-0.5">{g.summary}</p>
                          <p className="text-[10px] text-charcoal-200 font-mono mt-0.5">/guides/{g.slug}</p>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-forest-50 text-forest border border-forest-200 capitalize">
                            {g.category || 'basics'}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-charcoal-400">
                          {g.readTime || '4 min'}
                        </td>

                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPub ? (
                            <Badge variant="success">Published</Badge>
                          ) : (
                            <Badge variant="default">Draft</Badge>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Publish button */}
                            <button
                              onClick={() => handleTogglePublish(g)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-solar-600 hover:bg-solar-50 transition-colors"
                              title={isPub ? 'Unpublish (make draft)' : 'Publish immediately'}
                            >
                              {isPub ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>

                            {/* View Live */}
                            <Link
                              to={`/guides/${g.slug}`}
                              target="_blank"
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-forest hover:bg-forest-50 transition-colors"
                              title="View live article"
                            >
                              <ExternalLink size={14} />
                            </Link>

                            {/* Edit */}
                            <button
                              onClick={() => openEditModal(g)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit article"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(g)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete guide"
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

        {/* Modal: Create / Edit Guide */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={isEditing ? 'Edit Solar Guide' : 'Author New Solar Guide'}
          size="lg"
        >
          <form onSubmit={handleSaveGuide} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div>
              <label className="form-label">Article Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Understanding Rooftop Solar Inverters & Efficiency"
                value={formData.title}
                onChange={handleTitleChange}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="form-label">URL Slug</label>
                <input
                  type="text"
                  className="form-input font-mono text-xs"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {GUIDE_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Estimated Read Time</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 5 min read"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Summary (Card Teaser) *</label>
              <textarea
                rows={2}
                className="form-input resize-none"
                placeholder="A concise, 1-2 sentence overview suitable for beginners..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">
                Article Body Content
                <span className="text-charcoal-200 font-normal ml-2 text-xs">
                  (Supports headings with ##, bullets with -, and **bold**)
                </span>
              </label>
              <textarea
                rows={8}
                className="form-input font-mono text-xs resize-none"
                placeholder="Detailed explanations, technical parameters, and practical resident instructions..."
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                className="w-4 h-4 accent-forest"
                checked={formData.is_published}
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              />
              <span className="text-xs text-charcoal font-medium">
                Publish immediately to resident learning portal
              </span>
            </label>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Updates' : 'Publish Article'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Delete Guide */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Educational Article"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                Delete <strong>&quot;{deleteTarget?.title}&quot;</strong>?
                Residents will no longer have access to this educational guide.
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

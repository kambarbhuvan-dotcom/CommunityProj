/**
 * ManageEventsPage.jsx — Admin: Community Events & Workshops Management
 *
 * Implements:
 * 1. View all community events, workshops, campaigns, and clinics
 * 2. Add new workshops & events with capacity, dates, location, facilitator
 * 3. Edit event details and status (Upcoming, Completed, Cancelled)
 * 4. View registered residents list with units and registration timestamps
 * 5. Delete events with modal confirmation
 * 6. Track capacity filling rates
 */

import { useState, useEffect } from 'react'
import {
  Calendar, Plus, Pencil, Trash2, Users, MapPin, Clock,
  CheckCircle2, AlertCircle, ShieldCheck, UserCheck, X,
  Filter, Sparkles, BookOpen, ChevronRight, AlertTriangle
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import {
  getAllEvents, createEvent, updateEvent, deleteEvent,
  getEventRegistrations
} from '../../services/adminService'

const EVENT_CATEGORIES = [
  'Workshop',
  'Awareness Campaign',
  'Conservation',
  'Technical Clinic',
  'Residents Meet',
]

const emptyEventForm = {
  title: '',
  category: 'Workshop',
  date: '',
  time: '',
  location: '',
  facilitator: '',
  capacity: 30,
  description: '',
  status: 'upcoming',
}

export default function ManageEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all') // 'all' | 'upcoming' | 'completed' | 'cancelled'
  const [search, setSearch] = useState('')

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(emptyEventForm)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [registrationsTarget, setRegistrationsTarget] = useState(null)
  const [attendeesList, setAttendeesList] = useState([])

  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage((curr) => (curr === msg ? null : curr)), 3500)
  }

  async function loadEvents() {
    setLoading(true)
    try {
      const data = await getAllEvents()
      setEvents(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function openCreateModal() {
    setIsEditing(false)
    setFormData({
      ...emptyEventForm,
      date: 'Saturday, 12 Dec 2026',
      time: '10:00 AM – 12:30 PM',
      location: 'Community Clubhouse & Terrace',
      facilitator: 'Solar Advisory Team',
    })
    setFormError('')
    setShowFormModal(true)
  }

  function openEditModal(eventItem) {
    setIsEditing(true)
    setFormData({
      id: eventItem.id,
      title: eventItem.title,
      category: eventItem.category,
      date: eventItem.date,
      time: eventItem.time,
      location: eventItem.location,
      facilitator: eventItem.facilitator,
      capacity: eventItem.capacity || 30,
      description: eventItem.description || '',
      status: eventItem.status || 'upcoming',
    })
    setFormError('')
    setShowFormModal(true)
  }

  function openRegistrationsModal(eventItem) {
    setRegistrationsTarget(eventItem)
    const list = getEventRegistrations(eventItem.id)
    setAttendeesList(list)
  }

  async function handleSaveEvent(e) {
    e.preventDefault()
    if (!formData.title?.trim()) {
      setFormError('Please enter a workshop title.')
      return
    }
    if (!formData.date?.trim()) {
      setFormError('Please specify the event date.')
      return
    }

    try {
      if (isEditing) {
        await updateEvent(formData.id, formData)
        showToast(`Updated "${formData.title}" successfully.`)
      } else {
        await createEvent(formData)
        showToast(`Added new workshop: "${formData.title}".`)
      }
      setShowFormModal(false)
      loadEvents()
    } catch (err) {
      setFormError(err.message || 'Failed to save event.')
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return
    try {
      await deleteEvent(deleteTarget.id)
      showToast(`Event "${deleteTarget.title}" deleted.`)
      setDeleteTarget(null)
      loadEvents()
    } catch (err) {
      showToast(err.message || 'Failed to delete event.')
    }
  }

  async function handleToggleStatus(eventItem, newStatus) {
    try {
      await updateEvent(eventItem.id, { status: newStatus })
      showToast(`Marked "${eventItem.title}" as ${newStatus}.`)
      loadEvents()
    } catch (err) {
      showToast(err.message || 'Failed to update status.')
    }
  }

  const filteredEvents = events.filter((ev) => {
    const matchesStatus = filterStatus === 'all' || ev.status === filterStatus
    const matchesSearch =
      ev.title.toLowerCase().includes(search.toLowerCase()) ||
      ev.category.toLowerCase().includes(search.toLowerCase()) ||
      ev.location.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalUpcoming = events.filter((e) => e.status === 'upcoming').length
  const totalCompleted = events.filter((e) => e.status === 'completed').length
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Community Events & Workshops"
        subtitle="Schedule interactive solar clinics, view registered resident participants, and coordinate capacity."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button variant="primary" size="sm" onClick={openCreateModal}>
              <Plus size={14} /> Add Workshop
            </Button>
          </div>
        }
      >
        {/* Toast */}
        {toastMessage && (
          <div className="mb-4 p-3 rounded-xl bg-forest-50 border border-forest-200 text-forest text-sm flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-forest hover:text-forest-700">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-50 text-forest flex items-center justify-center shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-xs text-charcoal-300 font-medium">Upcoming Workshops</p>
              <p className="text-xl font-bold text-charcoal">{totalUpcoming}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-solar-50 text-solar-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-charcoal-300 font-medium">Total Registered Attendees</p>
              <p className="text-xl font-bold text-charcoal">{totalRegistrations}</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-xs text-charcoal-300 font-medium">Completed Sessions</p>
              <p className="text-xl font-bold text-charcoal">{totalCompleted}</p>
            </div>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search workshops or locations…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input text-xs py-2 w-full"
              />
            </div>
          </div>

          <div className="flex gap-1.5 p-1 bg-white border border-charcoal-100/40 rounded-xl shadow-xs">
            {['all', 'upcoming', 'completed', 'cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 text-xs rounded-lg font-medium capitalize transition-colors ${
                  filterStatus === st
                    ? 'bg-forest text-white'
                    : 'text-charcoal-300 hover:text-charcoal'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Events Table / Card Grid */}
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Event / Workshop</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Category</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Date & Time</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Location & Facilitator</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Registrations</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {filteredEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-charcoal-300 text-sm">
                      No events found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredEvents.map((ev) => {
                    const fillPercent = Math.min(
                      100,
                      Math.round(((ev.registeredCount || 0) / (ev.capacity || 30)) * 100)
                    )
                    return (
                      <tr key={ev.id} className="hover:bg-charcoal-100/10 transition-colors">
                        {/* Title & Description */}
                        <td className="px-4 py-3.5 max-w-xs">
                          <p className="font-semibold text-charcoal">{ev.title}</p>
                          <p className="text-xs text-charcoal-300 line-clamp-1 mt-0.5">{ev.description || 'No description provided'}</p>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-forest-50 text-forest border border-forest-200">
                            {ev.category}
                          </span>
                        </td>

                        {/* Date & Time */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-medium text-charcoal">{ev.date}</p>
                          <p className="text-[11px] text-charcoal-300 mt-0.5 flex items-center gap-1">
                            <Clock size={11} /> {ev.time}
                          </p>
                        </td>

                        {/* Location */}
                        <td className="px-4 py-3.5">
                          <p className="text-xs font-medium text-charcoal flex items-center gap-1">
                            <MapPin size={11} className="text-solar-500 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </p>
                          <p className="text-[11px] text-charcoal-300 truncate">Lead: {ev.facilitator}</p>
                        </td>

                        {/* Registrations */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <button
                            onClick={() => openRegistrationsModal(ev)}
                            className="text-left group cursor-pointer"
                            title="Click to view registered resident list"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-charcoal group-hover:text-forest transition-colors">
                                {ev.registeredCount || 0} / {ev.capacity || 30}
                              </span>
                              <span className="text-[11px] text-charcoal-300">({fillPercent}%)</span>
                            </div>
                            <div className="w-24 h-1.5 bg-charcoal-100/40 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  fillPercent >= 90 ? 'bg-solar-500' : 'bg-forest'
                                }`}
                                style={{ width: `${fillPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-forest underline group-hover:text-forest-700">View Roster</span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                              ev.status === 'upcoming'
                                ? 'bg-forest-100 text-forest'
                                : ev.status === 'completed'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-red-100 text-red-600'
                            }`}
                          >
                            {ev.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openRegistrationsModal(ev)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-forest hover:bg-forest-50 transition-colors"
                              title="View attendees"
                            >
                              <Users size={14} />
                            </button>
                            <button
                              onClick={() => openEditModal(ev)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit workshop"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(ev)}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete event"
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

        {/* Create / Edit Event Modal */}
        <Modal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          title={isEditing ? 'Edit Workshop Details' : 'Schedule Community Workshop'}
          size="lg"
        >
          <form onSubmit={handleSaveEvent} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div>
              <label className="form-label">Workshop / Event Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Net Metering & Inverter Safety Clinic"
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
                  {EVENT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Status</label>
                <select
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Date *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Saturday, 12 Dec 2026"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Time Window</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 10:00 AM – 1:00 PM"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Location / Meeting Point</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Community Clubhouse & Terrace"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Facilitator / Speaker</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DISCOM Empanelled Engineer"
                  value={formData.facilitator}
                  onChange={(e) => setFormData({ ...formData, facilitator: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Max Seating Capacity</label>
              <input
                type="number"
                min="5"
                max="200"
                className="form-input"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              />
            </div>

            <div>
              <label className="form-label">Event Description & Instructions</label>
              <textarea
                rows={3}
                className="form-input resize-none"
                placeholder="Details on what residents should bring, topics covered, and prerequisites..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setShowFormModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {isEditing ? 'Save Changes' : 'Schedule Workshop'}
              </Button>
            </div>
          </form>
        </Modal>

        {/* View Event Registrations Modal */}
        <Modal
          isOpen={!!registrationsTarget}
          onClose={() => setRegistrationsTarget(null)}
          title={`Registered Attendees — ${registrationsTarget?.title || ''}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-forest-50 border border-forest-100">
              <div>
                <p className="text-xs text-forest-700 font-medium">Capacity Status</p>
                <p className="text-sm font-bold text-forest">
                  {attendeesList.length} Registered / {registrationsTarget?.capacity || 30} Max Capacity
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest text-white">
                {Math.round(((attendeesList.length) / (registrationsTarget?.capacity || 30)) * 100)}% Filled
              </span>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-xl border border-charcoal-100/40">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                    <th className="px-3 py-2.5 font-semibold text-charcoal-300 uppercase">Resident Name</th>
                    <th className="px-3 py-2.5 font-semibold text-charcoal-300 uppercase">Unit</th>
                    <th className="px-3 py-2.5 font-semibold text-charcoal-300 uppercase">Email Contact</th>
                    <th className="px-3 py-2.5 font-semibold text-charcoal-300 uppercase">Registered Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100/30">
                  {attendeesList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-charcoal-300">
                        No residents have registered interest yet.
                      </td>
                    </tr>
                  ) : (
                    attendeesList.map((att) => (
                      <tr key={att.id} className="hover:bg-charcoal-100/10">
                        <td className="px-3 py-2.5 font-medium text-charcoal">{att.name}</td>
                        <td className="px-3 py-2.5 text-charcoal-300 font-mono">{att.unit}</td>
                        <td className="px-3 py-2.5 text-charcoal-400">{att.email}</td>
                        <td className="px-3 py-2.5 text-charcoal-300">
                          {att.registered_at ? new Date(att.registered_at).toLocaleDateString() : 'Recent'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-[11px] text-charcoal-300">
                Data protected under community privacy policy. For workshop logistics only.
              </p>
              <Button variant="ghost" onClick={() => setRegistrationsTarget(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete Event"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                Are you sure you want to delete <strong>&quot;{deleteTarget?.title}&quot;</strong>?
                Existing resident registrations for this workshop will be discarded.
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteConfirm}>
                Delete Workshop
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}


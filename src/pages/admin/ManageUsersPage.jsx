/**
 * ManageUsersPage.jsx — Admin: User & Role Governance
 *
 * Implements:
 * 1. View all community user accounts (name, email, unit, building, panel capacity, role, status)
 * 2. Search users by full name, email, or unit number
 * 3. Filter by role (Resident / Admin) and access status (Active / Suspended)
 * 4. Manage user roles (Promote to Admin / Revoke Admin) with confirmation modals
 * 5. Manage user access (Suspend account / Restore active status)
 * 6. Add new resident account modal
 * 7. Edit resident account details modal
 * 8. STRICT SECURITY GUARDS:
 *    - Anti-self-demotion: An admin cannot demote their own account
 *    - Anti-self-suspension: An admin cannot suspend their own account
 */

import { useState, useEffect } from 'react'
import {
  ShieldCheck, ShieldOff, Search, UserPlus, Pencil, Trash2,
  CheckCircle2, AlertTriangle, AlertCircle, Users, Lock, Unlock,
  X, Filter
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import {
  getAllUsers, updateUserRole, updateUserStatus, createUser,
  updateUserDetails, deleteUser
} from '../../services/adminService'

const emptyUserForm = {
  full_name: '',
  email: '',
  unit_number: '',
  building_name: 'Sunrise Apartments Block A',
  panel_count: 8,
  panel_capacity_kw: 4.0,
  role: 'resident',
}

export default function ManageUsersPage() {
  const { profile: myProfile } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all') // 'all' | 'resident' | 'admin'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'active' | 'suspended'

  // Modals state
  const [roleTarget, setRoleTarget] = useState(null)
  const [statusTarget, setStatusTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [formData, setFormData] = useState(emptyUserForm)
  const [formError, setFormError] = useState('')

  const [toastMessage, setToastMessage] = useState(null)

  function showToast(msg, isError = false) {
    setToastMessage({ text: msg, isError })
    setTimeout(() => setToastMessage((curr) => (curr?.text === msg ? null : curr)), 3500)
  }

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  // ─── Role Change Handler ───────────────────────────────────────────────────
  async function handleConfirmRoleChange() {
    if (!roleTarget) return
    const newRole = roleTarget.role === 'admin' ? 'resident' : 'admin'
    try {
      await updateUserRole(roleTarget.id, newRole, myProfile?.id)
      showToast(
        newRole === 'admin'
          ? `Promoted ${roleTarget.full_name} to Administrator.`
          : `Revoked admin access for ${roleTarget.full_name}.`
      )
      setRoleTarget(null)
      loadUsers()
    } catch (err) {
      showToast(err.message, true)
    }
  }

  // ─── Status Change Handler ─────────────────────────────────────────────────
  async function handleConfirmStatusChange() {
    if (!statusTarget) return
    const newStatus = statusTarget.status === 'active' ? 'suspended' : 'active'
    try {
      await updateUserStatus(statusTarget.id, newStatus, myProfile?.id)
      showToast(
        newStatus === 'suspended'
          ? `Suspended account access for ${statusTarget.full_name}.`
          : `Restored active access for ${statusTarget.full_name}.`
      )
      setStatusTarget(null)
      loadUsers()
    } catch (err) {
      showToast(err.message, true)
    }
  }

  // ─── Delete Handler ────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!deleteTarget) return
    try {
      await deleteUser(deleteTarget.id, myProfile?.id)
      showToast(`Removed user account for ${deleteTarget.full_name}.`)
      setDeleteTarget(null)
      loadUsers()
    } catch (err) {
      showToast(err.message, true)
    }
  }

  // ─── Create User Handler ───────────────────────────────────────────────────
  async function handleCreateUser(e) {
    e.preventDefault()
    if (!formData.full_name?.trim() || !formData.email?.trim() || !formData.unit_number?.trim()) {
      setFormError('Please fill in all required fields (Name, Email, Unit).')
      return
    }

    try {
      await createUser(formData)
      showToast(`Successfully created resident account for ${formData.full_name}.`)
      setShowCreateModal(false)
      setFormData(emptyUserForm)
      setFormError('')
      loadUsers()
    } catch (err) {
      setFormError(err.message)
    }
  }

  // ─── Edit User Handler ─────────────────────────────────────────────────────
  async function handleEditUser(e) {
    e.preventDefault()
    if (!editTarget) return

    try {
      await updateUserDetails(editTarget.id, {
        full_name: editTarget.full_name,
        email: editTarget.email,
        unit_number: editTarget.unit_number,
        panel_count: Number(editTarget.panel_count) || 0,
        panel_capacity_kw: Number(editTarget.panel_capacity_kw) || 0,
      })
      showToast(`Updated details for ${editTarget.full_name}.`)
      setEditTarget(null)
      loadUsers()
    } catch (err) {
      setFormError(err.message)
    }
  }

  const filtered = users.filter((p) => {
    const matchesSearch =
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.unit_number.toLowerCase().includes(search.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(search.toLowerCase()))

    const matchesRole = roleFilter === 'all' || (p.role || 'resident') === roleFilter
    const matchesStatus = statusFilter === 'all' || (p.status || 'active') === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  const totalAdmins = users.filter((u) => u.role === 'admin').length
  const totalResidents = users.filter((u) => u.role !== 'admin').length
  const totalSuspended = users.filter((u) => u.status === 'suspended').length

  return (
    <AppLayout>
      <PageWrapper
        title="Manage Users & Access Governance"
        subtitle="Supervise resident accounts, assign administrative privileges, and enforce security policies."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="admin"><ShieldCheck size={12} /> ADMIN</Badge>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setFormData(emptyUserForm)
                setFormError('')
                setShowCreateModal(true)
              }}
            >
              <UserPlus size={14} /> Add User
            </Button>
          </div>
        }
      >
        {/* Toast Alert */}
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

        {/* User Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Total Accounts</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{users.length}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Administrators</p>
            <p className="text-xl font-bold text-forest mt-0.5">{totalAdmins}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Resident Users</p>
            <p className="text-xl font-bold text-charcoal mt-0.5">{totalResidents}</p>
          </Card>
          <Card className="p-3.5">
            <p className="text-xs text-charcoal-300 font-medium">Suspended Access</p>
            <p className={`text-xl font-bold mt-0.5 ${totalSuspended > 0 ? 'text-red-500' : 'text-charcoal-300'}`}>
              {totalSuspended}
            </p>
          </Card>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, unit, or email…"
              className="form-input pl-9 text-xs py-2 w-full"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="all">All Roles</option>
              <option value="resident">Residents Only</option>
              <option value="admin">Admins Only</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input text-xs py-1.5 w-auto"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="suspended">Suspended Only</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <Card className="p-0 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-charcoal-100/20 border-b border-charcoal-100/40 text-left">
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Resident Name & Email</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Unit / Building</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Solar Setup</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Role</th>
                  <th className="px-4 py-3 text-xs font-semibold text-charcoal-300 uppercase">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-charcoal-300 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100/30">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-charcoal-300 text-sm">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const isMe = myProfile?.id === p.id || myProfile?.email === p.email
                    const isAdminUser = p.role === 'admin'
                    const isSuspended = p.status === 'suspended'

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-charcoal-100/10 transition-colors ${
                          isMe ? 'bg-forest-50/40' : ''
                        }`}
                      >
                        {/* Name & Email */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-semibold text-charcoal text-xs sm:text-sm">
                                {p.full_name}
                                {isMe && (
                                  <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] bg-forest text-white font-bold">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-charcoal-300">{p.email || '—'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Unit / Building */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-bold text-charcoal">{p.unit_number}</p>
                          <p className="text-[11px] text-charcoal-300">{p.building_name || 'Block A'}</p>
                        </td>

                        {/* Solar Setup */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-xs font-medium text-charcoal">{p.panel_capacity_kw || 0} kW</p>
                          <p className="text-[11px] text-charcoal-300">{p.panel_count || 0} Panels</p>
                        </td>

                        {/* Role */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant={isAdminUser ? 'admin' : 'default'} className="capitalize">
                            {p.role || 'resident'}
                          </Badge>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span
                            className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md capitalize ${
                              isSuspended
                                ? 'bg-red-100 text-red-600'
                                : 'bg-forest-100 text-forest'
                            }`}
                          >
                            {p.status || 'active'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Role Toggle button */}
                            {isMe ? (
                              <span className="text-[11px] text-charcoal-200 italic px-2">
                                (Self-Protected)
                              </span>
                            ) : isAdminUser ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRoleTarget(p)}
                                title="Demote to Resident"
                                className="text-charcoal-400 hover:text-amber-600 hover:bg-amber-50"
                              >
                                <ShieldOff size={13} className="mr-1" /> Revoke Admin
                              </Button>
                            ) : (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setRoleTarget(p)}
                                title="Promote to Administrator"
                              >
                                <ShieldCheck size={13} className="mr-1" /> Make Admin
                              </Button>
                            )}

                            {/* Status Lock/Unlock */}
                            {!isMe && (
                              <button
                                onClick={() => setStatusTarget(p)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  isSuspended
                                    ? 'text-forest hover:bg-forest-50'
                                    : 'text-charcoal-300 hover:text-amber-600 hover:bg-amber-50'
                                }`}
                                title={isSuspended ? 'Restore Active Access' : 'Suspend Account'}
                              >
                                {isSuspended ? <Unlock size={14} /> : <Lock size={14} />}
                              </button>
                            )}

                            {/* Edit */}
                            <button
                              onClick={() => {
                                setEditTarget({ ...p })
                                setFormError('')
                              }}
                              className="p-1.5 rounded-lg text-charcoal-300 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit user details"
                            >
                              <Pencil size={14} />
                            </button>

                            {/* Delete */}
                            {!isMe && (
                              <button
                                onClick={() => setDeleteTarget(p)}
                                className="p-1.5 rounded-lg text-charcoal-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Delete account"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
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

        {/* Modal: Confirm Role Change */}
        <Modal
          isOpen={!!roleTarget}
          onClose={() => setRoleTarget(null)}
          title="Confirm Role Modification"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-charcoal-300">
              {roleTarget?.role === 'admin'
                ? `Remove administrative access from ${roleTarget?.full_name}? They will be converted to a normal resident user.`
                : `Promote ${roleTarget?.full_name} to Administrator? They will be granted full access to audit records, manage users, and post community announcements.`}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setRoleTarget(null)}>
                Cancel
              </Button>
              <Button
                variant={roleTarget?.role === 'admin' ? 'danger' : 'primary'}
                onClick={handleConfirmRoleChange}
              >
                {roleTarget?.role === 'admin' ? 'Revoke Admin' : 'Confirm Promotion'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Confirm Status Change */}
        <Modal
          isOpen={!!statusTarget}
          onClose={() => setStatusTarget(null)}
          title={statusTarget?.status === 'active' ? 'Suspend Account' : 'Restore Account Access'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-sm text-charcoal-300">
              {statusTarget?.status === 'active'
                ? `Suspend access for ${statusTarget?.full_name}? The user will be blocked from logging in until re-activated.`
                : `Re-activate account for ${statusTarget?.full_name}? They will regain access to their resident dashboard.`}
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setStatusTarget(null)}>
                Cancel
              </Button>
              <Button
                variant={statusTarget?.status === 'active' ? 'danger' : 'primary'}
                onClick={handleConfirmStatusChange}
              >
                {statusTarget?.status === 'active' ? 'Suspend Account' : 'Re-activate'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Delete User */}
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Delete User Account"
          size="sm"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl border border-red-100 text-xs text-red-700">
              <AlertTriangle size={18} className="shrink-0 text-red-500 mt-0.5" />
              <div>
                Permanently delete account for <strong>{deleteTarget?.full_name}</strong> (Unit {deleteTarget?.unit_number})?
                This action cannot be undone.
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Delete User
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal: Create User */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add New Resident Account"
          size="md"
        >
          <form onSubmit={handleCreateUser} className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} /> {formError}
              </div>
            )}

            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Ananya Rao"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="resident@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Unit Number *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B-304"
                  value={formData.unit_number}
                  onChange={(e) => setFormData({ ...formData, unit_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Panel Count</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={formData.panel_count}
                  onChange={(e) => setFormData({ ...formData, panel_count: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Installed Capacity (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="form-input"
                  value={formData.panel_capacity_kw}
                  onChange={(e) => setFormData({ ...formData, panel_capacity_kw: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="form-label">Account Role</label>
              <select
                className="form-input"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="resident">Resident</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Account
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal: Edit User Details */}
        <Modal
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
          title={`Edit Details — ${editTarget?.full_name || ''}`}
          size="md"
        >
          {editTarget && (
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editTarget.full_name}
                  onChange={(e) => setEditTarget({ ...editTarget, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editTarget.email}
                    onChange={(e) => setEditTarget({ ...editTarget, email: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Unit Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editTarget.unit_number}
                    onChange={(e) => setEditTarget({ ...editTarget, unit_number: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="form-label">Panel Count</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={editTarget.panel_count}
                    onChange={(e) => setEditTarget({ ...editTarget, panel_count: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Capacity (kW)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    className="form-input"
                    value={editTarget.panel_capacity_kw}
                    onChange={(e) => setEditTarget({ ...editTarget, panel_capacity_kw: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-charcoal-100/30">
                <Button type="button" variant="ghost" onClick={() => setEditTarget(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}

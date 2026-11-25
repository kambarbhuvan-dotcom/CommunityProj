/**
 * RegisterPage.jsx — Resident Registration with Supabase Auth & Building Association
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sun, Mail, Lock, Eye, EyeOff, User, Hash, Layers, Building2, CheckCircle2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getCommunityBuildings } from '../../services/energyStorageService'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, loading: authLoading } = useAuth()

  const [form, setForm] = useState({
    full_name: '',
    email: '',
<<<<<<< HEAD
=======
    role: 'resident',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    password: '',
    confirm: '',
    building_id: '',
    unit_number: '',
    has_panels: false,
    panel_count: 8,
    panel_capacity_kw: 4.0,
  })

  const [buildings, setBuildings]   = useState([])
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  useEffect(() => {
    async function loadBuildings() {
      const list = await getCommunityBuildings()
      setBuildings(list)
      if (list.length > 0) {
        setForm((f) => ({ ...f, building_id: list[0].id }))
      }
    }
    loadBuildings()
  }, [])

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    setError('')

    const { error: signUpErr } = await signUp(form.email, form.password, {
      full_name: form.full_name,
<<<<<<< HEAD
=======
      role: form.role || 'resident',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
      unit_number: form.unit_number,
      building_id: form.building_id,
      panel_count: form.has_panels ? parseInt(form.panel_count) : 0,
      panel_capacity_kw: form.has_panels ? parseFloat(form.panel_capacity_kw) : 0,
    })

    setLoading(false)

    if (signUpErr) {
      setError(signUpErr.message || 'Registration failed.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#F4FAFF] flex items-center justify-center p-4">
        <div className="w-full max-w-sm card text-center p-6 shadow-card bg-white border border-[#DCEBFA]">
          <div className="w-14 h-14 rounded-2xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mx-auto mb-4 text-[#2563EB]">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-lg font-bold text-[#153B65] mb-2">Registration Successful</h2>
          <p className="text-sm text-[#64748B] mb-5">
            Your account has been created for <strong>{form.email}</strong>. You can now sign in to track your solar energy.
          </p>
          <Button variant="primary" className="w-full justify-center" onClick={() => navigate('/login')}>
            Continue to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
              <Sun size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-[#153B65] tracking-tight">SolarConnect</span>
          </Link>
        </div>

        <div className="card shadow-card bg-white border border-[#DCEBFA]">
          <h1 className="text-lg font-bold text-[#153B65] mb-1">Join SolarConnect</h1>
          <p className="text-sm text-[#64748B] mb-5">Register your household rooftop account</p>

          {error && (
            <Alert variant="error" className="mb-4" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="form-label">Full Name *</label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <input
                  name="full_name"
                  type="text"
                  required
                  value={form.full_name}
                  onChange={handleChange}
                  className="form-input pl-9 text-sm"
<<<<<<< HEAD
                  placeholder="e.g. Priya Sharma"
=======
                  placeholder="e.g. Ananya Rao"
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
                />
              </div>
            </div>

<<<<<<< HEAD
=======
            {/* Account Role */}
            <div>
              <label className="form-label">Account Role *</label>
              <div className="relative">
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="form-input text-sm"
                >
                  <option value="resident">Resident</option>
                  <option value="admin">Community Administrator</option>
                </select>
              </div>
            </div>

>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
            {/* Email */}
            <div>
              <label className="form-label">Email Address *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input pl-9 text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Building Selection */}
            <div>
              <label className="form-label">Apartment / Community Building *</label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <select
                  name="building_id"
                  value={form.building_id}
                  onChange={handleChange}
                  className="form-input pl-9 text-sm"
                  required
                >
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.building_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="form-label">Unit / Flat Number *</label>
              <div className="relative">
                <Hash size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <input
                  name="unit_number"
                  type="text"
                  required
                  value={form.unit_number}
                  onChange={handleChange}
                  className="form-input pl-9 text-sm"
                  placeholder="e.g. B-204"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pl-9 pr-10 text-sm"
                  placeholder="Min. 6 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-200 hover:text-charcoal-300"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="form-label">Confirm Password *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-200" />
                <input
                  name="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={handleChange}
                  className="form-input pl-9 text-sm"
                  placeholder="Repeat password"
                />
              </div>
            </div>

            {/* Panels toggle */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-charcoal-100/40 hover:bg-forest-50 transition-colors">
              <input
                type="checkbox"
                name="has_panels"
                checked={form.has_panels}
                onChange={handleChange}
                className="w-4 h-4 accent-forest rounded"
              />
              <div>
                <p className="text-sm font-medium text-charcoal">I have rooftop solar panels installed</p>
                <p className="text-xs text-charcoal-300">Enable to configure kW generation tracking</p>
              </div>
            </label>

            {/* Panel details */}
            {form.has_panels && (
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-forest-50 border border-forest-100">
                <div>
                  <label className="form-label">Panel Count</label>
                  <div className="relative">
                    <Layers size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-200" />
                    <input
                      name="panel_count"
                      type="number"
                      min="0"
                      value={form.panel_count}
                      onChange={handleChange}
                      className="form-input pl-8 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label">Capacity (kW)</label>
                  <input
                    name="panel_capacity_kw"
                    type="number"
                    min="0"
                    step="0.1"
                    value={form.panel_capacity_kw}
                    onChange={handleChange}
                    className="form-input text-sm"
                  />
                </div>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" loading={loading || authLoading} className="w-full">
              Register Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-charcoal-300 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-forest font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}

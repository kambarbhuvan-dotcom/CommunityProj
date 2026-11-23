/**
 * LoginPage.jsx — Authentication with Supabase & Quick Demo Logins
 * Sky-Inspired White & Blue Design
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Sun, Mail, Lock, Eye, EyeOff, ShieldCheck, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const { loginAsDemo, signIn } = useAuth()

  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: err } = await signIn(form.email, form.password)
      if (err) {
        setError(err.message || 'Login failed. Please check your credentials.')
        return
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  function handleDemoLogin(role) {
    loginAsDemo(role)
    if (role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="min-h-screen bg-[#F4FAFF] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brand Logo Header */}
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#2563EB] flex items-center justify-center shadow-xs">
              <Sun size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-[#153B65] tracking-tight">SolarConnect</span>
          </Link>
        </div>

        <div className="card shadow-card bg-white border border-[#DCEBFA]">
          <h1 className="text-lg font-bold text-[#153B65] mb-1">Welcome back</h1>
          <p className="text-sm text-[#64748B] mb-5">Sign in to your community solar portal</p>

          {error && (
            <Alert variant="error" className="mb-4" dismissible onDismiss={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label" htmlFor="email">Email address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="email"
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

            <div>
              <label className="form-label" htmlFor="password">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="form-input pl-9 pr-10 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#153B65]"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>

          {/* Quick Demo Access Buttons */}
          <div className="mt-6 pt-5 border-t border-[#DCEBFA]">
            <p className="text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-3">
              One-Click Instant Preview
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="w-full py-2.5 px-3 rounded-xl bg-[#EAF6FF] hover:bg-[#DCEBFA] text-[#2563EB] text-xs font-bold flex items-center justify-center gap-2 border border-[#DCEBFA] transition-colors"
              >
                <ShieldCheck size={15} />
                Sign In as Community Administrator
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('resident')}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#F4FAFF] text-[#153B65] text-xs font-semibold flex items-center justify-center gap-2 border border-[#DCEBFA] transition-colors shadow-xs"
              >
                <UserCheck size={15} className="text-[#0EA5E9]" />
                Sign In as Resident
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-[#64748B] mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#2563EB] font-bold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}

/**
 * ProfilePage.jsx — Resident settings
 */
import { useState } from 'react'
import { User, Layers, Mail, Lock } from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ProfilePage() {
  const { user, profile, refreshProfile, updateProfile } = useAuth()

  const [nameForm, setNameForm]   = useState({ full_name: profile?.full_name || '', unit_number: profile?.unit_number || '' })
  const [solarForm, setSolarForm] = useState({ panel_count: profile?.panel_count || 0, panel_capacity_kw: profile?.panel_capacity_kw || 0 })
  const [savingName, setSavingName]   = useState(false)
  const [savingSolar, setSavingSolar] = useState(false)
  const [nameAlert, setNameAlert]     = useState(null)
  const [solarAlert, setSolarAlert]   = useState(null)
  const [pwAlert, setPwAlert]         = useState(null)

  async function savePersonalInfo(e) {
    e.preventDefault()
    setSavingName(true)
    const { error } = await updateProfile({
      full_name: nameForm.full_name,
      unit_number: nameForm.unit_number,
    })
    setSavingName(false)
    if (error) { setNameAlert({ variant: 'error', msg: error.message }) }
    else { setNameAlert({ variant: 'success', msg: 'Profile updated successfully!' }); await refreshProfile() }
  }

  async function saveSolarSetup(e) {
    e.preventDefault()
    setSavingSolar(true)
    const { error } = await updateProfile({
      panel_count: parseInt(solarForm.panel_count) || 0,
      panel_capacity_kw: parseFloat(solarForm.panel_capacity_kw) || 0,
    })
    setSavingSolar(false)
    if (error) { setSolarAlert({ variant: 'error', msg: error.message }) }
    else { setSolarAlert({ variant: 'success', msg: 'Solar setup saved!' }); await refreshProfile() }
  }

  async function sendPasswordReset() {
    const { error } = await supabase.auth.resetPasswordForEmail(user?.email)
    if (error) setPwAlert({ variant: 'error', msg: error.message })
    else setPwAlert({ variant: 'success', msg: 'Password reset link sent to your email.' })
  }

  return (
    <AppLayout>
      <PageWrapper title="Settings" subtitle="Manage your profile, solar setup, and account security.">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">

            {/* Personal info */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-charcoal-300" />
                <h3 className="section-heading">Personal Information</h3>
              </div>
              {nameAlert && <Alert variant={nameAlert.variant} className="mb-4" dismissible onDismiss={() => setNameAlert(null)}>{nameAlert.msg}</Alert>}
              <form onSubmit={savePersonalInfo} className="space-y-4">
                <div>
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={nameForm.full_name}
                    onChange={(e) => setNameForm((f) => ({ ...f, full_name: e.target.value }))} required />
                </div>
                <div>
                  <label className="form-label">Unit / Flat number</label>
                  <input className="form-input" value={nameForm.unit_number}
                    onChange={(e) => setNameForm((f) => ({ ...f, unit_number: e.target.value }))} />
                </div>
                <Button type="submit" variant="primary" size="sm" loading={savingName}>Save Changes</Button>
              </form>
            </Card>

            {/* Solar setup */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Layers size={16} className="text-charcoal-300" />
                <h3 className="section-heading">Solar Panel Setup</h3>
              </div>
              {solarAlert && <Alert variant={solarAlert.variant} className="mb-4" dismissible onDismiss={() => setSolarAlert(null)}>{solarAlert.msg}</Alert>}
              <form onSubmit={saveSolarSetup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Panel count</label>
                    <input type="number" min="0" className="form-input" value={solarForm.panel_count}
                      onChange={(e) => setSolarForm((f) => ({ ...f, panel_count: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Total capacity (kW)</label>
                    <input type="number" min="0" step="0.1" className="form-input" value={solarForm.panel_capacity_kw}
                      onChange={(e) => setSolarForm((f) => ({ ...f, panel_capacity_kw: e.target.value }))} />
                  </div>
                </div>
                <Button type="submit" variant="primary" size="sm" loading={savingSolar}>Save Solar Setup</Button>
              </form>
            </Card>

            {/* Account security */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Lock size={16} className="text-charcoal-300" />
                <h3 className="section-heading">Account Security</h3>
              </div>
              {pwAlert && <Alert variant={pwAlert.variant} className="mb-4" dismissible onDismiss={() => setPwAlert(null)}>{pwAlert.msg}</Alert>}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <Mail size={14} className="text-charcoal-300" />
                    <span className="text-sm text-charcoal-300">{user?.email}</span>
                  </div>
                  <p className="text-xs text-charcoal-200">Email address (read-only)</p>
                </div>
                <Button variant="secondary" size="sm" onClick={sendPasswordReset}>Reset Password</Button>
              </div>
            </Card>
          </div>

          {/* Profile summary sidebar */}
          <div className="space-y-5">
            <Card className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center mx-auto mb-3 text-2xl font-bold text-[#2563EB] shadow-xs">
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-[#153B65] text-base">{profile?.full_name || 'Your Name'}</h3>
              <p className="text-sm text-[#64748B]">Unit {profile?.unit_number || '—'}</p>
              <div className="mt-4 p-3 rounded-xl bg-[#F4FAFF] border border-[#DCEBFA] text-left space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Panels</span>
                  <span className="font-semibold text-[#153B65]">{profile?.panel_count ?? 0}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B]">Capacity</span>
                  <span className="font-semibold text-[#153B65]">{profile?.panel_capacity_kw ?? 0} kW</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AppLayout>
  )
}


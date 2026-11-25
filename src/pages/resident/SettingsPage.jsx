/**
 * SettingsPage.jsx
 *
 * Dedicated application settings page for users:
 * - Electricity tariff customization (INR/kWh)
 * - Grid emission factor configuration (kg CO2/kWh)
 * - Household utility & consumption preferences
 * - Account information
 * - Real data management (Clear / Reset all user logs)
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  SlidersHorizontal, Zap, Leaf, Home, RotateCcw,
  CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import Modal from '../../components/ui/Modal'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { getUserSettings, saveUserSettings, clearAllUserData } from '../../services/solarDataService'
import { ELECTRICITY_PROVIDERS } from '../../utils/constants'

export default function SettingsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetting, setResetting] = useState(false)

  const [settings, setSettings] = useState({
    electricity_tariff_inr: 7.50,
    grid_emission_factor: 0.82,
    avg_daily_consumption_kwh: '',
    avg_monthly_consumption_kwh: '',
    household_members: 4,
    electricity_provider: 'HESCOM (Hubballi)',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const loaded = await getUserSettings(user?.id)
        if (loaded) {
          setSettings({
            electricity_tariff_inr: loaded.electricity_tariff_inr ?? 7.50,
            grid_emission_factor: loaded.grid_emission_factor ?? 0.82,
            avg_daily_consumption_kwh: loaded.avg_daily_consumption_kwh ?? '',
            avg_monthly_consumption_kwh: loaded.avg_monthly_consumption_kwh ?? '',
            household_members: loaded.household_members ?? 4,
            electricity_provider: loaded.electricity_provider || 'HESCOM (Hubballi)',
          })
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setAlertInfo(null)

    const tariff = parseFloat(settings.electricity_tariff_inr)
    if (isNaN(tariff) || tariff <= 0) {
      setAlertInfo({ variant: 'error', message: 'Please enter a valid positive electricity tariff.' })
      return
    }

    const factor = parseFloat(settings.grid_emission_factor)
    if (isNaN(factor) || factor <= 0) {
      setAlertInfo({ variant: 'error', message: 'Please enter a valid grid emission factor.' })
      return
    }

    setSaving(true)
    try {
      await saveUserSettings(user?.id, settings)
      setAlertInfo({
        variant: 'success',
        message: 'Settings saved successfully! Financial savings and CO₂ emission calculations have been updated.',
      })
    } catch (err) {
      setAlertInfo({ variant: 'error', message: 'Failed to update settings.' })
    } finally {
      setSaving(false)
    }
  }

  async function handleResetData() {
    setResetting(true)
    try {
      await clearAllUserData(user?.id)
      setShowResetModal(false)
      setAlertInfo({
        variant: 'success',
        message: 'All your logged energy records and configuration have been reset to empty state.',
      })
    } catch {
      setAlertInfo({ variant: 'error', message: 'Failed to reset records.' })
    } finally {
      setResetting(false)
    }
  }

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
        title="Settings & Tariffs"
        subtitle="Configure electricity rates, regional carbon grid factors, and manage your data."
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
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Calculation Tariffs Card */}
              <Card className="border border-[#DCEBFA] shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#DCEBFA]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                    <Zap size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#153B65]">Calculation Multipliers</h2>
                    <p className="text-xs text-[#64748B]">
                      Formulas use these exact variables to calculate your monetary savings and emissions offset.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tariff */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Electricity Tariff (₹ per kWh) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#64748B]">₹</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0.5"
                        required
                        value={settings.electricity_tariff_inr}
                        onChange={(e) => setSettings({ ...settings, electricity_tariff_inr: e.target.value })}
                        className="w-full pl-7 pr-12 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">/kWh</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block">
                      Default ₹7.50/kWh based on Indian residential averages.
                    </span>
                  </div>

                  {/* Grid emission factor */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Grid Emission Factor (kg CO₂ / kWh) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="2.0"
                        required
                        value={settings.grid_emission_factor}
                        onChange={(e) => setSettings({ ...settings, grid_emission_factor: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kg/kWh</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block">
                      Central Electricity Authority (CEA) standard factor is 0.82.
                    </span>
                  </div>
                </div>
              </Card>

              {/* Household & Utility Card */}
              <Card className="border border-[#DCEBFA] shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#DCEBFA]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                    <Home size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#153B65]">Household Profile & DISCOM</h2>
                    <p className="text-xs text-[#64748B]">
                      Used for per-capita energy metrics and provider comparison.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Electricity Provider */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Electricity Provider / Utility
                    </label>
                    <select
                      value={settings.electricity_provider}
                      onChange={(e) => setSettings({ ...settings, electricity_provider: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      {ELECTRICITY_PROVIDERS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Household Members */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Household Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={settings.household_members}
                      onChange={(e) => setSettings({ ...settings, household_members: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Avg Daily */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Average Daily Consumption (kWh)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder="e.g. 15.0"
                      value={settings.avg_daily_consumption_kwh}
                      onChange={(e) => setSettings({ ...settings, avg_daily_consumption_kwh: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Avg Monthly */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Average Monthly Consumption (kWh)
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      placeholder="e.g. 450"
                      value={settings.avg_monthly_consumption_kwh}
                      onChange={(e) => setSettings({ ...settings, avg_monthly_consumption_kwh: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  className="px-6 py-2.5 text-sm font-bold shadow-sm"
                >
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Save Settings
                </Button>
              </div>
            </form>

            {/* Danger Zone / Data Management */}
            <Card className="border border-rose-200 bg-rose-50/30 p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-600" />
                    Reset Stored Data
                  </h3>
                  <p className="text-xs text-rose-700/80 mt-1 max-w-md">
                    Permanently delete all your entered energy records and reset your solar system configuration back to empty state.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowResetModal(true)}
                  className="border-rose-300 text-rose-700 hover:bg-rose-100 hover:border-rose-400 text-xs shrink-0"
                >
                  <RotateCcw size={14} className="mr-1.5" />
                  Reset All Data
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick links & info */}
          <div className="space-y-6">
            <Card className="border border-[#DCEBFA] shadow-sm bg-gradient-to-br from-white to-[#F4FAFF]">
              <h3 className="text-xs font-bold text-[#153B65] uppercase tracking-wider mb-3">
                Solar Hardware
              </h3>
              <p className="text-xs text-[#64748B] mb-4">
                Need to change your rooftop panel capacity, inverter size, or battery storage specifications?
              </p>
              <Link
                to="/setup"
                className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#DCEBFA] text-xs font-bold text-[#2563EB] hover:bg-[#EAF6FF] transition-all"
              >
                <span>Edit My Solar Setup</span>
                <ArrowRight size={14} />
              </Link>
            </Card>

            <Card className="border border-[#DCEBFA] p-4 text-xs text-[#64748B] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#153B65]">
                <ShieldCheck size={14} className="text-[#0EA5E9]" />
                Standards & Compliance
              </div>
              <p>
                Electricity savings are calculated on non-exported solar energy utilized on-site plus any credit allowed by your DISCOM. Grid emissions factor adheres to CEA CO₂ Baseline Database for the Indian Power Sector.
              </p>
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showResetModal}
          onClose={() => setShowResetModal(false)}
          title="Reset All Solar Data?"
        >
          <div className="space-y-4">
            <p className="text-sm text-[#64748B]">
              Are you sure you want to delete all your entered solar energy logs and system setup? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-3 border-t border-[#DCEBFA]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetModal(false)}
                disabled={resetting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleResetData}
                loading={resetting}
                className="bg-rose-600 hover:bg-rose-700 text-white border-transparent"
              >
                Yes, Reset All Data
              </Button>
            </div>
          </div>
        </Modal>
      </PageWrapper>
    </AppLayout>
  )
}


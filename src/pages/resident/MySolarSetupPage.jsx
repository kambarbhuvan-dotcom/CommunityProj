/**
 * MySolarSetupPage.jsx
 *
 * Dedicated setup page where users input their actual solar installation
 * and household electricity parameters.
 *
 * Section A: Solar Installation Details
 *   - System Capacity (kW)
 *   - Solar Panel Type
 *   - Number of Panels
 *   - Installation Date
 *   - City / Location in India
 *   - Inverter Capacity (kW)
 *   - Battery Storage Included? (Yes/No) + Capacity (kWh)
 *   - System Type (On-Grid, Off-Grid, Hybrid)
 *
 * Section B: Electricity & Tariff Details
 *   - Average Daily Consumption (kWh)
 *   - Average Monthly Consumption (kWh)
 *   - Current Electricity Tariff (INR/kWh) (default 7.50)
 *   - Household Members
 *   - Electricity Provider
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sun, BatteryCharging, Zap, MapPin, Calendar, CheckCircle2,
  AlertCircle, ShieldCheck, ArrowRight, Sparkles, SlidersHorizontal
} from 'lucide-react'
import AppLayout from '../../components/layout/AppLayout'
import PageWrapper from '../../components/layout/PageWrapper'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Alert from '../../components/ui/Alert'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuth } from '../../context/AuthContext'
import { getSolarSetup, saveSolarSetup, getUserSettings, saveUserSettings } from '../../services/solarDataService'
import { INDIAN_CITIES, ELECTRICITY_PROVIDERS, PANEL_TYPES, SYSTEM_TYPES } from '../../utils/constants'

export default function MySolarSetupPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)

  // Section A: Solar System details
  const [setup, setSetup] = useState({
    system_capacity_kw: '',
    panel_type: 'Monocrystalline',
    panel_count: '',
    installation_date: '',
    city_location: 'Hubballi',
    inverter_capacity_kw: '',
    has_battery_storage: false,
    battery_capacity_kwh: '',
    system_type: 'on_grid',
  })

  // Section B: Electricity & Tariff details
  const [settings, setSettings] = useState({
    avg_daily_consumption_kwh: '',
    avg_monthly_consumption_kwh: '',
    electricity_tariff_inr: 7.50,
    grid_emission_factor: 0.82,
    household_members: 4,
    electricity_provider: 'HESCOM (Hubballi)',
  })

  const [savedConfig, setSavedConfig] = useState(null)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [loadedSetup, loadedSettings] = await Promise.all([
          getSolarSetup(user?.id),
          getUserSettings(user?.id),
        ])

        if (loadedSetup) {
          setSetup({
            system_capacity_kw: loadedSetup.system_capacity_kw || '',
            panel_type: loadedSetup.panel_type || 'Monocrystalline',
            panel_count: loadedSetup.panel_count || '',
            installation_date: loadedSetup.installation_date || '',
            city_location: loadedSetup.city_location || 'Hubballi',
            inverter_capacity_kw: loadedSetup.inverter_capacity_kw || '',
            has_battery_storage: Boolean(loadedSetup.has_battery_storage),
            battery_capacity_kwh: loadedSetup.battery_capacity_kwh || '',
            system_type: loadedSetup.system_type || 'on_grid',
          })
          setSavedConfig(loadedSetup)
        }

        if (loadedSettings) {
          setSettings({
            avg_daily_consumption_kwh: loadedSettings.avg_daily_consumption_kwh ?? '',
            avg_monthly_consumption_kwh: loadedSettings.avg_monthly_consumption_kwh ?? '',
            electricity_tariff_inr: loadedSettings.electricity_tariff_inr ?? 7.50,
            grid_emission_factor: loadedSettings.grid_emission_factor ?? 0.82,
            household_members: loadedSettings.household_members ?? 4,
            electricity_provider: loadedSettings.electricity_provider || 'HESCOM (Hubballi)',
          })
        }
      } catch (err) {
        console.error('Failed to load setup:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [user?.id])

  async function handleSubmit(e) {
    e.preventDefault()
    setAlertInfo(null)

    // Validation
    const cap = parseFloat(setup.system_capacity_kw)
    if (isNaN(cap) || cap <= 0) {
      setAlertInfo({ variant: 'error', message: 'Please enter a valid positive system capacity (kW).' })
      return
    }

    if (setup.has_battery_storage) {
      const bat = parseFloat(setup.battery_capacity_kwh)
      if (isNaN(bat) || bat <= 0) {
        setAlertInfo({ variant: 'error', message: 'Please enter a positive battery capacity (kWh).' })
        return
      }
    }

    const tariff = parseFloat(settings.electricity_tariff_inr)
    if (isNaN(tariff) || tariff <= 0) {
      setAlertInfo({ variant: 'error', message: 'Please enter a valid electricity tariff (₹/kWh).' })
      return
    }

    setSaving(true)
    try {
      const [resSetup] = await Promise.all([
        saveSolarSetup(user?.id, setup),
        saveUserSettings(user?.id, settings),
      ])

      setSavedConfig(resSetup)
      setAlertInfo({
        variant: 'success',
        message: 'Solar installation details and tariff parameters saved successfully! All analytics will now reflect your exact configuration.',
      })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setAlertInfo({ variant: 'error', message: 'Failed to save configuration. Please try again.' })
    } finally {
      setSaving(false)
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
        title="My Solar Setup"
        subtitle="Configure your real rooftop solar hardware specifications and local electricity tariff parameters."
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
          {/* Main Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* SECTION A: Solar Installation Details */}
              <Card className="border border-[#DCEBFA] shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#DCEBFA]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                    <Sun size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#153B65]">
                      Section A: Solar Installation Details
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Physical rooftop installation parameters from your installer or sanction letter.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* System Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      System Capacity (kW) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="1000"
                        required
                        placeholder="e.g. 5.0"
                        value={setup.system_capacity_kw}
                        onChange={(e) => setSetup({ ...setup, system_capacity_kw: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kW</span>
                    </div>
                  </div>

                  {/* Panel Type */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Solar Panel Type
                    </label>
                    <select
                      value={setup.panel_type}
                      onChange={(e) => setSetup({ ...setup, panel_type: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    >
                      {PANEL_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Panel Count */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Number of Panels
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 12"
                      value={setup.panel_count}
                      onChange={(e) => setSetup({ ...setup, panel_count: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Installation Date */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Installation Date
                    </label>
                    <input
                      type="date"
                      value={setup.installation_date}
                      onChange={(e) => setSetup({ ...setup, installation_date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {/* City Location */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      City / Location in India
                    </label>
                    <div className="relative">
                      <select
                        value={setup.city_location}
                        onChange={(e) => setSetup({ ...setup, city_location: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      >
                        {INDIAN_CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Inverter Capacity */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Inverter Capacity (kW)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        placeholder="e.g. 5.0"
                        value={setup.inverter_capacity_kw}
                        onChange={(e) => setSetup({ ...setup, inverter_capacity_kw: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kW</span>
                    </div>
                  </div>

                  {/* System Type */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      System Type
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {SYSTEM_TYPES.map((st) => (
                        <label
                          key={st.value}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                            setup.system_type === st.value
                              ? 'border-[#2563EB] bg-[#EAF6FF]/60 text-[#2563EB]'
                              : 'border-[#DCEBFA] bg-white text-[#64748B] hover:border-[#87CEEB]'
                          }`}
                        >
                          <input
                            type="radio"
                            name="system_type"
                            value={st.value}
                            checked={setup.system_type === st.value}
                            onChange={(e) => setSetup({ ...setup, system_type: e.target.value })}
                            className="mt-0.5 text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          <div>
                            <span className="text-xs font-bold text-[#153B65] block">{st.label}</span>
                            <span className="text-[11px] text-[#64748B] block leading-tight">{st.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Battery Storage Toggle */}
                  <div className="sm:col-span-2 p-4 rounded-xl bg-[#F4FAFF] border border-[#DCEBFA] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <BatteryCharging size={18} className="text-[#0EA5E9]" />
                        <div>
                          <p className="text-xs font-bold text-[#153B65]">Battery Storage Included?</p>
                          <p className="text-[11px] text-[#64748B]">Does your solar installation include a home battery pack?</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#153B65] cursor-pointer">
                          <input
                            type="radio"
                            name="has_battery"
                            checked={setup.has_battery_storage === true}
                            onChange={() => setSetup({ ...setup, has_battery_storage: true })}
                            className="text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-[#153B65] cursor-pointer">
                          <input
                            type="radio"
                            name="has_battery"
                            checked={setup.has_battery_storage === false}
                            onChange={() => setSetup({ ...setup, has_battery_storage: false, battery_capacity_kwh: '' })}
                            className="text-[#2563EB] focus:ring-[#2563EB]"
                          />
                          No
                        </label>
                      </div>
                    </div>

                    {setup.has_battery_storage && (
                      <div className="pt-2 border-t border-[#DCEBFA]">
                        <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                          Battery Capacity (kWh) <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            step="0.5"
                            min="0.5"
                            placeholder="e.g. 5.0"
                            value={setup.battery_capacity_kwh}
                            onChange={(e) => setSetup({ ...setup, battery_capacity_kwh: e.target.value })}
                            className="w-full px-3.5 py-2 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                          />
                          <span className="absolute right-3 top-2 text-xs font-semibold text-[#64748B]">kWh</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* SECTION B: Electricity & Tariff Details */}
              <Card className="border border-[#DCEBFA] shadow-sm">
                <div className="flex items-center gap-3 pb-4 mb-5 border-b border-[#DCEBFA]">
                  <div className="w-10 h-10 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#2563EB]">
                    <Zap size={20} className="stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#153B65]">
                      Section B: Electricity & Tariff Details
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Billing rates and household utility information used to calculate monetary savings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Current Electricity Tariff */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Electricity Tariff (₹ / kWh) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-semibold text-[#64748B]">₹</span>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        required
                        placeholder="7.50"
                        value={settings.electricity_tariff_inr}
                        onChange={(e) => setSettings({ ...settings, electricity_tariff_inr: e.target.value })}
                        className="w-full pl-7 pr-12 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">/kWh</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block">State utility average (typically ₹6.50 - ₹9.00)</span>
                  </div>

                  {/* Electricity Provider */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Electricity Provider / DISCOM
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

                  {/* Avg Daily Consumption */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Avg Daily Consumption (kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="e.g. 15.0"
                        value={settings.avg_daily_consumption_kwh}
                        onChange={(e) => setSettings({ ...settings, avg_daily_consumption_kwh: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh/day</span>
                    </div>
                  </div>

                  {/* Avg Monthly Consumption */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Avg Monthly Consumption (kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        placeholder="e.g. 450"
                        value={settings.avg_monthly_consumption_kwh}
                        onChange={(e) => setSettings({ ...settings, avg_monthly_consumption_kwh: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kWh/mo</span>
                    </div>
                  </div>

                  {/* Household Members */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Household Members
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="25"
                      value={settings.household_members}
                      onChange={(e) => setSettings({ ...settings, household_members: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  {/* Grid Emission Factor */}
                  <div>
                    <label className="block text-xs font-bold text-[#153B65] uppercase tracking-wider mb-1.5">
                      Grid Emission Factor (kg CO₂ / kWh)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.1"
                        max="2.0"
                        value={settings.grid_emission_factor}
                        onChange={(e) => setSettings({ ...settings, grid_emission_factor: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCEBFA] bg-white text-sm text-[#153B65] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-semibold text-[#64748B]">kg/kWh</span>
                    </div>
                    <span className="text-[11px] text-[#64748B] mt-1 block">CEA India baseline (0.82 kg CO₂/kWh)</span>
                  </div>
                </div>
              </Card>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={saving}
                  className="px-6 py-2.5 text-sm font-bold shadow-sm"
                >
                  <CheckCircle2 size={16} className="mr-1.5" />
                  Save Solar Configuration
                </Button>
              </div>
            </form>
          </div>

          {/* Configuration Summary Card / Sidebar */}
          <div className="space-y-6">
            <Card className="border border-[#DCEBFA] shadow-sm bg-gradient-to-br from-white to-[#F4FAFF]">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#DCEBFA]">
                <Sparkles size={16} className="text-[#0EA5E9]" />
                <h3 className="text-sm font-bold text-[#153B65] uppercase tracking-wide">
                  Active Configuration
                </h3>
              </div>

              {savedConfig?.system_capacity_kw ? (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-white border border-[#DCEBFA] shadow-xs">
                    <span className="text-[11px] text-[#64748B] block font-medium">Installed Capacity</span>
                    <span className="text-2xl font-extrabold text-[#2563EB] tracking-tight">
                      {savedConfig.system_capacity_kw} <span className="text-sm font-semibold text-[#153B65]">kW</span>
                    </span>
                    <div className="mt-2 pt-2 border-t border-[#DCEBFA]/60 flex items-center justify-between text-xs text-[#64748B]">
                      <span>Panel Type</span>
                      <span className="font-semibold text-[#153B65]">{savedConfig.panel_type}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#DCEBFA]/50">
                      <span className="text-[#64748B]">Location</span>
                      <span className="font-semibold text-[#153B65]">{savedConfig.city_location || 'Not set'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#DCEBFA]/50">
                      <span className="text-[#64748B]">System Architecture</span>
                      <span className="font-semibold text-[#153B65] capitalize">{savedConfig.system_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#DCEBFA]/50">
                      <span className="text-[#64748B]">Battery Storage</span>
                      <span className="font-semibold text-[#153B65]">
                        {savedConfig.has_battery_storage ? `${savedConfig.battery_capacity_kwh} kWh Battery` : 'None (Direct Grid)'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#DCEBFA]/50">
                      <span className="text-[#64748B]">DISCOM / Provider</span>
                      <span className="font-semibold text-[#153B65]">{settings.electricity_provider || 'Local DISCOM'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#64748B]">Applied Tariff</span>
                      <span className="font-bold text-[#22C55E]">₹{Number(settings.electricity_tariff_inr).toFixed(2)} / kWh</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] text-xs text-[#153B65] space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 size={13} className="text-[#2563EB]" />
                      Ready for Daily Logging
                    </p>
                    <p className="text-[11px] text-[#64748B]">
                      Your daily generation and monetary savings will be calculated using this exact setup.
                    </p>
                  </div>

                  <Link
                    to="/log"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition-all shadow-xs"
                  >
                    <span>Log Daily Energy Usage</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6 px-2 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EAF6FF] text-[#0EA5E9] flex items-center justify-center mx-auto">
                    <SlidersHorizontal size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#153B65]">No Setup Saved Yet</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Fill out Section A and Section B to calibrate your personalized dashboard.
                    </p>
                  </div>
                </div>
              )}
            </Card>

            <Card className="border border-[#DCEBFA] p-4 text-xs text-[#64748B] space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#153B65]">
                <ShieldCheck size={14} className="text-[#0EA5E9]" />
                Privacy & Data Accuracy
              </div>
              <p>
                SolarConnect does not share your tariff or meter readings. All calculation formulas adhere to Indian Central Electricity Authority (CEA) guidelines and state net-metering regulations.
              </p>
            </Card>
          </div>
        </div>
      </PageWrapper>
    </AppLayout>
  )
}


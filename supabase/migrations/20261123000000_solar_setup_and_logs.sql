-- ============================================================================
-- Migration: 20261123000000_solar_setup_and_logs.sql
-- Real User Solar Data Platform: solar_systems, user_settings, energy_logs
-- Enables Row Level Security (RLS) so each authenticated user manages only their own data
-- ============================================================================

-- 1. SOLAR SYSTEMS TABLE (Solar Installation Details)
CREATE TABLE IF NOT EXISTS public.solar_systems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    system_capacity_kw NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (system_capacity_kw >= 0),
    panel_type TEXT NOT NULL DEFAULT 'Monocrystalline' CHECK (panel_type IN ('Monocrystalline', 'Polycrystalline', 'Thin-film', 'Other')),
    panel_count INTEGER NOT NULL DEFAULT 0 CHECK (panel_count >= 0),
    installation_date DATE,
    location TEXT,
    inverter_capacity_kw NUMERIC(8, 2) DEFAULT 0.0 CHECK (inverter_capacity_kw >= 0),
    system_type TEXT NOT NULL DEFAULT 'On-grid' CHECK (system_type IN ('On-grid', 'Off-grid', 'Hybrid')),
    battery_available BOOLEAN NOT NULL DEFAULT false,
    battery_capacity_kwh NUMERIC(8, 2) DEFAULT 0.0 CHECK (battery_capacity_kwh >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_solar_system_user UNIQUE (user_id)
);

-- 2. USER SETTINGS TABLE (Consumption details & configurable calculation factors)
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    avg_daily_consumption_kwh NUMERIC(8, 2) DEFAULT 0.0 CHECK (avg_daily_consumption_kwh >= 0),
    avg_monthly_consumption_kwh NUMERIC(8, 2) DEFAULT 0.0 CHECK (avg_monthly_consumption_kwh >= 0),
    electricity_tariff NUMERIC(8, 2) NOT NULL DEFAULT 7.50 CHECK (electricity_tariff >= 0),
    grid_emission_factor NUMERIC(6, 4) NOT NULL DEFAULT 0.8200 CHECK (grid_emission_factor >= 0),
    household_members INTEGER DEFAULT 1 CHECK (household_members >= 1),
    electricity_provider TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_user_settings_user UNIQUE (user_id)
);

-- 3. ENERGY LOGS TABLE (Actual Daily Energy Usage Data)
CREATE TABLE IF NOT EXISTS public.energy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    solar_system_id UUID REFERENCES public.solar_systems(id) ON DELETE SET NULL,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    solar_generated_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (solar_generated_kwh >= 0),
    total_consumption_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (total_consumption_kwh >= 0),
    grid_import_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (grid_import_kwh >= 0),
    grid_export_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (grid_export_kwh >= 0),
    battery_charge_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (battery_charge_kwh >= 0),
    battery_discharge_kwh NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (battery_discharge_kwh >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_energy_log_user_date UNIQUE (user_id, log_date)
);

-- ----------------------------------------------------------------------------
-- INDEXES FOR HIGH-PERFORMANCE ANALYTICS
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_solar_systems_user_id ON public.solar_systems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_id ON public.energy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_logs_date ON public.energy_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON public.energy_logs(user_id, log_date DESC);

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.solar_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;

-- Solar Systems RLS
DROP POLICY IF EXISTS "Users can view own solar system" ON public.solar_systems;
CREATE POLICY "Users can view own solar system"
    ON public.solar_systems FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own solar system" ON public.solar_systems;
CREATE POLICY "Users can insert own solar system"
    ON public.solar_systems FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own solar system" ON public.solar_systems;
CREATE POLICY "Users can update own solar system"
    ON public.solar_systems FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own solar system" ON public.solar_systems;
CREATE POLICY "Users can delete own solar system"
    ON public.solar_systems FOR DELETE
    USING (auth.uid() = user_id);

-- User Settings RLS
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Energy Logs RLS
DROP POLICY IF EXISTS "Users can view own energy logs" ON public.energy_logs;
CREATE POLICY "Users can view own energy logs"
    ON public.energy_logs FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own energy logs" ON public.energy_logs;
CREATE POLICY "Users can insert own energy logs"
    ON public.energy_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own energy logs" ON public.energy_logs;
CREATE POLICY "Users can update own energy logs"
    ON public.energy_logs FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own energy logs" ON public.energy_logs;
CREATE POLICY "Users can delete own energy logs"
    ON public.energy_logs FOR DELETE
    USING (auth.uid() = user_id);


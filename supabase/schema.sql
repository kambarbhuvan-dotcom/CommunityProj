-- ============================================================================
-- SolarConnect — Master Supabase SQL Setup Script
-- Tables: profiles, buildings, energy_records, solar_guides, announcements, event_registrations
-- Features: Row Level Security (RLS), Triggers, Aggregated Views, Performance Indexes, Initial Seed Data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. BUILDINGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2. USER PROFILES TABLE (Linked 1-to-1 with auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
    building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
    unit_number TEXT DEFAULT '',
    panel_count INTEGER DEFAULT 0 CHECK (panel_count >= 0),
    panel_capacity_kw NUMERIC(6, 2) DEFAULT 0.0 CHECK (panel_capacity_kw >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. ENERGY RECORDS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.energy_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES public.buildings(id) ON DELETE SET NULL,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
    solar_generated NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (solar_generated >= 0),
    electricity_consumed NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (electricity_consumed >= 0),
    solar_utilized NUMERIC(8, 2) NOT NULL DEFAULT 0.0 CHECK (solar_utilized >= 0),
    notes TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_util_le_gen CHECK (solar_utilized <= solar_generated),
    CONSTRAINT chk_util_le_con CHECK (solar_utilized <= electricity_consumed)
);

-- ----------------------------------------------------------------------------
-- 4. SOLAR GUIDES TABLE (Educational Content)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.solar_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'basics',
    description TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 5. ANNOUNCEMENTS TABLE (Campaigns & Community Notices)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 6. EVENT REGISTRATIONS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_event_user UNIQUE (event_id, user_id)
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_building_id ON public.profiles(building_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_energy_records_building_id ON public.energy_records(building_id);
CREATE INDEX IF NOT EXISTS idx_energy_records_created_by ON public.energy_records(created_by);
CREATE INDEX IF NOT EXISTS idx_energy_records_recorded_date ON public.energy_records(recorded_date DESC);
CREATE INDEX IF NOT EXISTS idx_solar_guides_category ON public.solar_guides(category);
CREATE INDEX IF NOT EXISTS idx_announcements_event_date ON public.announcements(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON public.event_registrations(user_id);

-- ----------------------------------------------------------------------------
-- SECURITY DEFINER FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------
-- Helper to verify admin privileges in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Automatic profile creation on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, role, building_id)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email,
        'resident',
        (new.raw_user_meta_data->>'building_id')::uuid
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- Trigger preventing non-admins from promoting themselves or admins from self-demoting
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF OLD.role <> NEW.role AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: You do not have permission to modify account privileges.';
    END IF;

    IF OLD.id = auth.uid() AND OLD.role = 'admin' AND NEW.role <> 'admin' THEN
        RAISE EXCEPTION 'Security Policy: Administrators cannot revoke their own administrative role.';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE OF role ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();

-- ----------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solar_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

-- 1. Buildings RLS
CREATE POLICY "Allow read access to buildings"
    ON public.buildings FOR SELECT
    USING (TRUE);

CREATE POLICY "Allow admins to manage buildings"
    ON public.buildings FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 2. Profiles RLS
CREATE POLICY "Allow authenticated users to read profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Allow users to update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow admins to update any profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 3. Energy Records RLS
CREATE POLICY "Users view own records; Admins view all"
    ON public.energy_records FOR SELECT
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users insert own records"
    ON public.energy_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users update own records; Admins update all"
    ON public.energy_records FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin())
    WITH CHECK (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users delete own records; Admins delete all"
    ON public.energy_records FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin());

-- 4. Solar Guides RLS
CREATE POLICY "Allow read access to solar guides"
    ON public.solar_guides FOR SELECT
    USING (TRUE);

CREATE POLICY "Allow admins to insert solar guides"
    ON public.solar_guides FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to update solar guides"
    ON public.solar_guides FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to delete solar guides"
    ON public.solar_guides FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 5. Announcements RLS
CREATE POLICY "Allow read access to announcements"
    ON public.announcements FOR SELECT
    USING (TRUE);

CREATE POLICY "Allow admins to insert announcements"
    ON public.announcements FOR INSERT
    TO authenticated
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to update announcements"
    ON public.announcements FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

CREATE POLICY "Allow admins to delete announcements"
    ON public.announcements FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- 6. Event Registrations RLS
CREATE POLICY "Users view own event registrations; Admins view all"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users register for events"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cancel own registration"
    ON public.event_registrations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- SAFE AGGREGATED VIEWS (Privacy-Preserving Dashboard Statistics)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_dashboard_stats AS
SELECT
    COUNT(DISTINCT er.id) AS total_records,
    COUNT(DISTINCT b.id) AS total_buildings,
    COUNT(DISTINCT p.id) AS total_households,
    COALESCE(SUM(er.solar_generated), 0)::NUMERIC(10, 2) AS total_solar_generated_kwh,
    COALESCE(SUM(er.electricity_consumed), 0)::NUMERIC(10, 2) AS total_electricity_consumed_kwh,
    COALESCE(SUM(er.solar_utilized), 0)::NUMERIC(10, 2) AS total_solar_utilized_kwh,
    ROUND(COALESCE(SUM(er.solar_utilized), 0) * 7.50, 2) AS estimated_savings_inr,
    ROUND(COALESCE(SUM(er.solar_generated), 0) * 0.82, 2) AS estimated_co2_avoided_kg
FROM public.energy_records er
LEFT JOIN public.buildings b ON er.building_id = b.id
LEFT JOIN public.profiles p ON er.created_by = p.id;

CREATE OR REPLACE VIEW public.building_aggregated_stats AS
SELECT
    b.id AS building_id,
    b.building_name,
    b.location,
    COUNT(DISTINCT p.id) AS participating_households,
    COALESCE(SUM(er.solar_generated), 0)::NUMERIC(10, 2) AS total_solar_generated_kwh,
    COALESCE(SUM(er.solar_utilized), 0)::NUMERIC(10, 2) AS total_solar_utilized_kwh,
    COALESCE(SUM(er.electricity_consumed), 0)::NUMERIC(10, 2) AS total_electricity_consumed_kwh,
    ROUND(
        CASE
            WHEN SUM(er.solar_generated) > 0
            THEN (SUM(er.solar_utilized) / SUM(er.solar_generated)) * 100
            ELSE 0
        END,
        1
    ) AS self_sufficiency_pct
FROM public.buildings b
LEFT JOIN public.profiles p ON p.building_id = b.id
LEFT JOIN public.energy_records er ON er.building_id = b.id
GROUP BY b.id, b.building_name, b.location;

-- ----------------------------------------------------------------------------
-- INITIAL SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO public.buildings (id, building_name, location)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Sunrise Apartments Block A', '12 Vidyanagar Main Road, Hubballi'),
    ('22222222-2222-2222-2222-222222222222', 'Sunrise Apartments Block B', '14 Vidyanagar Main Road, Hubballi'),
    ('33333333-3333-3333-3333-333333333333', 'Green Valley Eco-Homes', '5th Cross, Unkal Lake View, Hubballi'),
    ('44444444-4444-4444-4444-444444444444', 'Solar Heights Residency', '7th Main, Gokul Road, Hubballi'),
    ('55555555-5555-5555-5555-555555555555', 'EcoView Community Park', 'Airport Road, Hubballi')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.solar_guides (id, title, category, description, content)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Introduction to Rooftop Solar Energy',
        'basics',
        'A comprehensive beginner-friendly overview of residential rooftop photovoltaic systems in India.',
        '## What is Rooftop Solar Energy?\n\nRooftop solar photovoltaic (PV) systems generate electricity directly from sunlight using semiconductor solar cells.\n\n### Why Adopt Solar in Your Community?\n- **Financial Savings**: Cut residential utility bills by up to 70-90%.\n- **Clean Grid Support**: Displace fossil fuel reliance.\n- **Long Lifespan**: Tier-1 solar panels carry 25-30 year performance warranties.'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'How Solar Panels Work: The Photovoltaic Effect',
        'basics',
        'Understand how photons knock electrons loose in silicon wafers to generate direct current (DC).',
        '## The Science of Solar Electricity\n\nSolar cells are fabricated from crystalline silicon treated with phosphorus and boron to create a p-n junction.\n\n### Step-by-Step Power Generation:\n1. **Absorption**: Sunlight strikes silicon semiconductor wafers.\n2. **Inversion**: The on-grid inverter transforms DC into 230V single-phase or 415V three-phase AC.\n3. **Bi-directional Metering**: Excess power feeds back to the DISCOM grid.'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Solar Panel Technologies: Mono vs Poly vs TOPCon',
        'panels',
        'Compare Monocrystalline, Polycrystalline, and next-generation N-type TOPCon panels.',
        '## Comparing Modern PV Technologies\n\nChoosing the right solar cell architecture depends on rooftop area constraints and temperature coefficients.\n\n- **Monocrystalline PERC**: 20-21.5% efficiency. Great value for urban roofs.\n- **N-Type TOPCon**: 22-23.5% efficiency. Highest yield in hot climates.\n- **Polycrystalline**: 15-17% efficiency. Economical for large open spaces.'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'PM Surya Ghar: Muft Bijli Yojana & Net-Metering',
        'savings',
        'Official Central Government rooftop solar subsidy structure and DISCOM application procedures.',
        '## PM Surya Ghar: National Rooftop Solar Scheme\n\nUnder MNRE direct central financial assistance:\n- **1 kW System**: ₹30,000 subsidy\n- **2 kW System**: ₹60,000 subsidy\n- **3 kW & Above**: ₹78,000 maximum central subsidy.\n\n*Apply via pmsuryaghar.gov.in.*'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.announcements (id, title, description, event_date)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Solar Inverter Health & Safety Inspection Camp',
        'Free multimeter earthing check, SPD testing, and inverter firmware audit for all installed community units.',
        '2026-11-28'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'PM Surya Ghar & Net-Metering Feasibility Clinic',
        'DISCOM authorized engineers will review roof feasibility documents and guide residents on single-window subsidy application.',
        '2026-12-06'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Bi-Monthly Community Panel Cleaning Drive',
        'Volunteers and maintenance staff are coordinating seasonal panel washing to optimize winter kilowatt-hour yields.',
        '2026-12-12'
    )
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------------------
-- 7. SOLAR SYSTEMS (Installation Details)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 8. USER SETTINGS (Consumption Details & Factors)
-- ----------------------------------------------------------------------------
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

-- ----------------------------------------------------------------------------
-- 9. ENERGY LOGS (Daily User Solar & Grid Readings)
-- ----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_solar_systems_user ON public.solar_systems(user_id);
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON public.user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user ON public.energy_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_energy_logs_user_date ON public.energy_logs(user_id, log_date DESC);

ALTER TABLE public.solar_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own solar system" ON public.solar_systems FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own energy logs" ON public.energy_logs FOR ALL USING (auth.uid() = user_id);

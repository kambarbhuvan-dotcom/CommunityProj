-- ============================================================================
-- SolarConnect Database Schema Migration
-- Migration: 20261122000000_create_solarconnect_schema.sql
-- ============================================================================

-- Enable UUID extension
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
-- 2. PROFILES TABLE (Linked 1-to-1 with auth.users)
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
-- 5. ANNOUNCEMENTS TABLE (Campaigns, Workshops & Notices)
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
-- INDEXES FOR PERFORMANCE
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
-- HELPER FUNCTIONS FOR RLS
-- ----------------------------------------------------------------------------
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

-- Trigger to automatically create a profile when a new user signs up in auth.users
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

-- Trigger to prevent users from escalating their own role to 'admin'
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
CREATE POLICY "Allow public/authenticated read access to buildings"
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
CREATE POLICY "Users can view own energy records; Admins can view all"
    ON public.energy_records FOR SELECT
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users can insert own energy records"
    ON public.energy_records FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users can update own energy records; Admins can update any"
    ON public.energy_records FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin())
    WITH CHECK (auth.uid() = created_by OR public.is_admin());

CREATE POLICY "Users can delete own energy records; Admins can delete any"
    ON public.energy_records FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by OR public.is_admin());

-- 4. Solar Guides RLS
CREATE POLICY "Allow everyone to read solar guides"
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
CREATE POLICY "Allow everyone to view announcements"
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
CREATE POLICY "Users can view own registrations; Admins can view all"
    ON public.event_registrations FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can register for events"
    ON public.event_registrations FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can cancel own registration; Admins can cancel any"
    ON public.event_registrations FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- ----------------------------------------------------------------------------
-- SAFE AGGREGATED VIEWS (Privacy-Preserving Public Dashboard Statistics)
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


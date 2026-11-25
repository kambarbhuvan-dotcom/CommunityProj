-- ============================================================================
-- SolarConnect Initial Seed Data
-- Migration: 20261122000001_seed_initial_data.sql
-- ============================================================================

-- 1. Insert Initial Participating Buildings
INSERT INTO public.buildings (id, building_name, location)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Sunrise Apartments Block A', '12 Green Park Road, Bengaluru'),
    ('22222222-2222-2222-2222-222222222222', 'Sunrise Apartments Block B', '14 Green Park Road, Bengaluru'),
    ('33333333-3333-3333-3333-333333333333', 'Green Valley Eco-Homes', '5th Cross, Indiranagar, Bengaluru'),
    ('44444444-4444-4444-4444-444444444444', 'Solar Heights Residency', '7th Main, HSR Layout, Bengaluru'),
    ('55555555-5555-5555-5555-555555555555', 'EcoView Community Park', 'Whitefield Main Road, Bengaluru')
ON CONFLICT (id) DO UPDATE
SET building_name = EXCLUDED.building_name,
    location = EXCLUDED.location;

-- 2. Insert Solar Educational Guides (Learn Solar Hub)
INSERT INTO public.solar_guides (id, title, category, description, content)
VALUES
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'Introduction to Rooftop Solar Energy',
        'basics',
        'A comprehensive beginner-friendly overview of residential rooftop photovoltaic systems in India.',
        '## What is Rooftop Solar Energy?

Rooftop solar photovoltaic (PV) systems generate electricity directly from sunlight using semiconductor solar cells.

### Why Adopt Solar in Your Community?
- **Financial Savings**: Cut residential utility bills by up to 70-90%.
- **Clean Grid Support**: Displace fossil fuel reliance (coal generation accounts for ~70% of Indian grid electricity).
- **Long Lifespan**: Modern Tier-1 solar panels carry 25-30 year performance warranties with linear degradation (<0.5% per year).'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'How Solar Panels Work: The Photovoltaic Effect',
        'basics',
        'Understand how photons knock electrons loose in silicon wafers to generate direct current (DC).',
        '## The Science of Solar Electricity

Solar cells are fabricated from refined crystalline silicon treated with phosphorus and boron to create a p-n semiconductor junction.

### Step-by-Step Power Generation:
1. **Absorption**: Sunlight strikes silicon semiconductor wafers.
2. **Excitation**: Photons transfer energy to valence electrons, creating electron-hole pairs.
3. **Inversion**: The on-grid inverter transforms DC into 230V single-phase or 415V three-phase alternating current (AC).
4. **Bi-directional Metering**: Excess generated clean power feeds the municipal distribution company (DISCOM) grid.'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'Solar Panel Technologies: Mono vs Poly vs TOPCon',
        'panels',
        'Compare Monocrystalline, Polycrystalline, and next-generation N-type TOPCon panels.',
        '## Comparing Modern PV Technologies

Choosing the right solar cell architecture depends on rooftop area constraints and temperature coefficients.

| Panel Type | Efficiency | Temperature Coeff. | Ideal Rooftop |
| :--- | :--- | :--- | :--- |
| **Monocrystalline PERC** | 20.0% – 21.5% | -0.35% / °C | Medium urban roofs |
| **N-Type TOPCon** | 22.0% – 23.5% | -0.30% / °C | Compact high-yield roofs |
| **Polycrystalline** | 15.0% – 17.0% | -0.40% / °C | Large suburban plots |'
    ),
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'PM Surya Ghar: Muft Bijli Yojana & Net-Metering',
        'savings',
        'Official Central Government rooftop solar subsidy structure and DISCOM application procedures.',
        '## PM Surya Ghar: National Rooftop Solar Scheme

Launched by the Ministry of New and Renewable Energy (MNRE), PM Surya Ghar provides direct central financial assistance (CFA).

### Official Subsidy Structure:
- **1 kW System**: ₹30,000 direct subsidy.
- **2 kW System**: ₹60,000 direct subsidy.
- **3 kW & Above**: ₹78,000 maximum central subsidy.

*Verification Note: Always verify final empanelment and vendor quotation through the national portal (pmsuryaghar.gov.in).*'
    )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Community Announcements
INSERT INTO public.announcements (id, title, description, event_date)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Solar Inverter Health & Safety Inspection Camp',
        'Free multimeter earthing check, SPD testing, and inverter firmware audit for all installed community units. Recommended for systems operating over 1 year.',
        '2026-11-28'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'PM Surya Ghar & Net-Metering Feasibility Clinic',
        'Local DISCOM authorized engineers will review roof feasibility documents and guide residents on single-window subsidy application procedures.',
        '2026-12-06'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Bi-Monthly Community Panel Cleaning Drive',
        'Volunteers and maintenance staff are coordinating seasonal panel washing to wash off airborne dust and optimize winter kilowatt-hour yields.',
        '2026-12-12'
    )
ON CONFLICT (id) DO NOTHING;


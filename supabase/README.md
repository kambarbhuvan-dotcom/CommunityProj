# SolarConnect — Supabase Database & Authentication Configuration

This document provides complete instructions for provisioning and configuring Supabase for **SolarConnect**.

---

## 1. Supabase Project Setup

1. Go to [https://supabase.com](https://supabase.com) and sign in or create an account.
2. Click **New Project**.
3. Choose an organization, provide a project name (e.g., `solarconnect`), set a secure database password, and choose your preferred region (e.g. `ap-south-1` for Mumbai / India).
4. Once the project is provisioned, go to **Project Settings** → **API**.
5. Copy your **Project URL** and your **anon public** API key.

---

## 2. Environment Variables (.env)

In the root directory of `solar_connect`, copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!WARNING]
> **Security Notice**: Never paste your `service_role` key into `.env` or client-side code. The `anon` key is safe for client usage because **Row Level Security (RLS)** policies strictly govern what each user can see and modify.

---

## 3. SQL Scripts Execution

You can configure the entire database using either the single master script or sequential migration scripts:

### Option A: Master Script (Recommended for Supabase Web Console)
1. Open your Supabase Dashboard: **SQL Editor** → **New Query**.
2. Open the file [`supabase/schema.sql`](file:///c:/solar_connect/supabase/schema.sql).
3. Copy its entire content, paste it into the SQL Editor, and click **Run**.

### Option B: Migration Files (Supabase CLI)
If you use the Supabase CLI:
- [`supabase/migrations/20261122000000_create_solarconnect_schema.sql`](file:///c:/solar_connect/supabase/migrations/20261122000000_create_solarconnect_schema.sql): Creates all 6 tables, relations, indexes, RLS policies, security functions, and aggregated views.
- [`supabase/migrations/20261122000001_seed_initial_data.sql`](file:///c:/solar_connect/supabase/migrations/20261122000001_seed_initial_data.sql): Seeds initial participating buildings, educational solar guides, and announcements.

---

## 4. Database Tables & Architecture

| Table | Purpose | Primary Key | Foreign Keys / Relationships |
| :--- | :--- | :--- | :--- |
| **`profiles`** | Resident and Admin profile data linked to auth users | `id` (UUID) | References `auth.users(id)` ON DELETE CASCADE, `building_id` -> `buildings(id)` |
| **`buildings`** | Participating apartment blocks & communities | `id` (UUID) | Referenced by `profiles` and `energy_records` |
| **`energy_records`** | Daily/monthly solar generation & consumption records | `id` (UUID) | `building_id` -> `buildings(id)`, `created_by` -> `profiles(id)` |
| **`solar_guides`** | Educational solar articles and installation guides | `id` (UUID) | Managed by administrators |
| **`announcements`** | Community campaigns, workshops, and milestones | `id` (UUID) | Referenced by `event_registrations` |
| **`event_registrations`** | Resident workshop registrations & attendance | `id` (UUID) | `event_id` -> `announcements(id)`, `user_id` -> `profiles(id)` |

---

## 5. Row Level Security (RLS) & Access Governance

- **Strict User Privacy**:
  - `energy_records`: Normal users can only SELECT, INSERT, UPDATE, or DELETE records where `created_by = auth.uid()`.
  - Normal users cannot inspect or tamper with another household's energy measurements.
- **Admin Privileges**:
  - Verified via the security definer function `public.is_admin()`.
  - Administrators can inspect all records, audit community logs, and manage educational content.
- **Anti-Self-Escalation & Safety**:
  - Database trigger `prevent_self_role_escalation` prevents non-admin users from altering their role to `admin`.
  - Administrators cannot accidentally revoke their own admin rights.
- **Aggregated Statistics**:
  - `public_dashboard_stats` and `building_aggregated_stats` aggregate generation and consumption totals without exposing individual household records.

---

## 6. Authentication Flows

1. **User Registration** (`/register`):
   - Signs up the resident in `auth.users`.
   - Creates a linked row in `public.profiles` with `role = 'resident'` and associates them with their apartment building.
2. **User Login** (`/login`):
   - Authenticates via email and password using `supabase.auth.signInWithPassword`.
   - Loads the user's role from `public.profiles` to enforce frontend and backend route permissions.
3. **User Logout** (`Topbar` / `Sidebar`):
   - Terminates the session via `supabase.auth.signOut()`.


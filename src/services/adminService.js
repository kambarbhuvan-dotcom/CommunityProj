/**
 * adminService.js
 *
 * Data and management layer for the SolarConnect Admin Panel:
 * 1. User Management (CRUD, roles, active/suspended status, anti-self-demotion)
 * 2. Energy Records Management (bridges to energyStorageService with admin privileges)
 * 3. Educational Content Management (solar guides CRUD, publish/draft toggles)
 * 4. Announcements Management (CRUD, pin/unpin, categories)
 * 5. Community Events & Workshops Management (CRUD, view registrations, capacity)
 * 6. Admin Overview Metrics (aggregated community statistics)
 */

import { DEMO_PROFILES, DEMO_GUIDES, DEMO_ANNOUNCEMENTS } from '../data/demoData'
import { COMMUNITY_EVENTS, BUILDING_LEADERBOARD } from '../data/communityData'
import { getAllRecords, saveRecord, deleteRecord } from './energyStorageService'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
<<<<<<< HEAD
=======
import { api, localBackendReady } from '../lib/localBackend'
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae

// Local storage keys for persistent admin-managed states
const USERS_STORAGE_KEY = 'solarconnect_admin_users_v1'
const GUIDES_STORAGE_KEY = 'solarconnect_admin_guides_v1'
const ANNOUNCEMENTS_STORAGE_KEY = 'solarconnect_admin_announcements_v1'
const EVENTS_STORAGE_KEY = 'solarconnect_admin_events_v1'
const BUILDINGS_STORAGE_KEY = 'solarconnect_admin_buildings_v1'

// ─── 1. USER MANAGEMENT ────────────────────────────────────────────────────────

const DEFAULT_USERS = DEMO_PROFILES.map((p, idx) => ({
  id: p.id || `usr-${idx + 1}`,
  full_name: p.full_name,
  email: `${p.full_name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
  unit_number: p.unit_number,
  building_id: p.building_id || 'b1',
  building_name: 'Sunrise Apartments Block A',
  panel_count: p.panel_count || 8,
  panel_capacity_kw: p.panel_capacity_kw || 4.0,
  role: p.role || (idx === 0 ? 'admin' : 'resident'),
  status: 'active', // 'active' | 'suspended'
  created_at: p.created_at || '2026-09-01T08:00:00Z',
}))

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('[adminService] Failed to read users from localStorage:', err)
  }
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
  } catch {}
  return DEFAULT_USERS
}

export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (err) {
    console.error('[adminService] Failed to save users:', err)
  }
}

export async function getAllUsers() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, buildings(building_name)')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((u) => ({
          ...u,
          building_name: u.buildings?.building_name || 'Sunrise Apartments Block A',
        }))
      }
    } catch (err) {
      console.warn('[adminService] Supabase profiles fetch error, using local:', err)
    }
  }
  return getStoredUsers()
}

export async function updateUserRole(userId, newRole, requestingUserId) {
  if (userId === requestingUserId && newRole !== 'admin') {
    throw new Error('Security policy violation: Administrators cannot revoke their own admin privileges.')
  }

  if (isSupabaseConfigured && !userId.startsWith('usr-')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId)

      if (error) throw error
    } catch (err) {
      console.warn('[adminService] Supabase role update warning:', err.message)
    }
  }

  const users = getStoredUsers()
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, role: newRole, updated_at: new Date().toISOString() }
    }
    return u
  })
  saveUsers(updated)
  return updated.find((u) => u.id === userId)
}

export async function updateUserStatus(userId, newStatus, requestingUserId) {
  if (userId === requestingUserId && newStatus === 'suspended') {
    throw new Error('Security policy violation: You cannot suspend your own administrative account.')
  }
  const users = getStoredUsers()
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, status: newStatus, updated_at: new Date().toISOString() }
    }
    return u
  })
  saveUsers(updated)
  return updated.find((u) => u.id === userId)
}

export async function createUser(userData) {
  const users = getStoredUsers()
  const newUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    full_name: userData.full_name?.trim() || 'New Resident',
    email: userData.email?.trim() || 'resident@example.com',
    unit_number: userData.unit_number?.trim() || 'A-100',
    building_id: userData.building_id || 'b1',
    building_name: userData.building_name || 'Sunrise Apartments Block A',
    panel_count: Number(userData.panel_count) || 0,
    panel_capacity_kw: Number(userData.panel_capacity_kw) || 0,
    role: userData.role || 'resident',
    status: 'active',
    created_at: new Date().toISOString(),
  }
  const updated = [newUser, ...users]
  saveUsers(updated)
  return newUser
}

export async function updateUserDetails(userId, updates) {
  const users = getStoredUsers()
  const updated = users.map((u) => {
    if (u.id === userId) {
      return { ...u, ...updates, updated_at: new Date().toISOString() }
    }
    return u
  })
  saveUsers(updated)
  return updated.find((u) => u.id === userId)
}

export async function deleteUser(userId, requestingUserId) {
  if (userId === requestingUserId) {
    throw new Error('Security policy violation: You cannot delete your own account.')
  }
  const users = getStoredUsers()
  const filtered = users.filter((u) => u.id !== userId)
  saveUsers(filtered)
  return true
}

// ─── 2. COMMUNITY EVENTS & WORKSHOPS ──────────────────────────────────────────

const DEFAULT_EVENT_REGISTRATIONS = {
  'evt-1': [
<<<<<<< HEAD
    { id: 'reg-1', name: 'Dr. Ramesh Sharma', unit: 'A-101', email: 'ramesh.sharma@example.com', registered_at: '2026-11-18T10:30:00Z' },
    { id: 'reg-2', name: 'Priya Sundaram', unit: 'B-204', email: 'priya.sundaram@example.com', registered_at: '2026-11-19T14:15:00Z' },
=======
    { id: 'reg-1', name: 'Community Administrator', unit: 'A-101', email: 'admin@solarconnect.local', registered_at: '2026-11-18T10:30:00Z' },
    { id: 'reg-2', name: 'Solar Resident', unit: 'B-204', email: 'resident@solarconnect.local', registered_at: '2026-11-19T14:15:00Z' },
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    { id: 'reg-3', name: 'Vikram Joshi', unit: 'C-302', email: 'vikram.joshi@example.com', registered_at: '2026-11-20T09:00:00Z' },
    { id: 'reg-4', name: 'Ananya Deshmukh', unit: 'A-202', email: 'ananya.deshmukh@example.com', registered_at: '2026-11-20T16:45:00Z' },
  ],
  'evt-2': [
    { id: 'reg-5', name: 'Kavita Menon', unit: 'B-103', email: 'kavita.menon@example.com', registered_at: '2026-11-21T11:20:00Z' },
    { id: 'reg-6', name: 'Siddharth Rao', unit: 'C-104', email: 'siddharth.rao@example.com', registered_at: '2026-11-21T15:00:00Z' },
  ],
  'evt-3': [
    { id: 'reg-7', name: 'Meera Patel', unit: 'A-305', email: 'meera.patel@example.com', registered_at: '2026-11-22T08:30:00Z' },
  ],
}

export function getStoredEvents() {
  try {
    const raw = localStorage.getItem(EVENTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(COMMUNITY_EVENTS))
  } catch {}
  return COMMUNITY_EVENTS
}

export function saveEvents(events) {
  try {
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events))
  } catch (err) {
    console.error('[adminService] Failed to save events:', err)
  }
}

export async function getAllEvents() {
  return getStoredEvents()
}

export async function createEvent(eventData) {
  const events = getStoredEvents()
  const newEvent = {
    id: `evt-${Date.now()}`,
    title: eventData.title?.trim() || 'Solar Workshop',
    category: eventData.category || 'Workshop',
    date: eventData.date || 'Saturday, 15 Dec 2026',
    time: eventData.time || '10:00 AM – 12:00 PM',
    location: eventData.location || 'Community Clubhouse',
    facilitator: eventData.facilitator || 'Solar Advisory Panel',
    registeredCount: 0,
    capacity: Number(eventData.capacity) || 30,
    status: eventData.status || 'upcoming', // 'upcoming' | 'completed' | 'cancelled'
    description: eventData.description || '',
    created_at: new Date().toISOString(),
  }
  const updated = [newEvent, ...events]
  saveEvents(updated)
  return newEvent
}

export async function updateEvent(eventId, updates) {
  const events = getStoredEvents()
  const updated = events.map((ev) => {
    if (ev.id === eventId) {
      return { ...ev, ...updates, updated_at: new Date().toISOString() }
    }
    return ev
  })
  saveEvents(updated)
  return updated.find((ev) => ev.id === eventId)
}

export async function deleteEvent(eventId) {
  const events = getStoredEvents()
  const filtered = events.filter((ev) => ev.id !== eventId)
  saveEvents(filtered)
  return true
}

export function getEventRegistrations(eventId) {
  try {
    const raw = localStorage.getItem(`solarconnect_registrations_${eventId}`)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch {}
  return DEFAULT_EVENT_REGISTRATIONS[eventId] || [
    { id: 'reg-default', name: 'Registered Resident', unit: 'Unit A-101', email: 'resident@example.com', registered_at: '2026-11-20T10:00:00Z' },
  ]
}

export function addEventRegistration(eventId, attendee) {
  const list = getEventRegistrations(eventId)
  const newAttendee = {
    id: `reg-${Date.now()}`,
    name: attendee.name || 'Resident Attendee',
    unit: attendee.unit || 'A-101',
    email: attendee.email || 'attendee@example.com',
    registered_at: new Date().toISOString(),
  }
  const updated = [newAttendee, ...list]
  try {
    localStorage.setItem(`solarconnect_registrations_${eventId}`, JSON.stringify(updated))
  } catch {}

  // Update registeredCount in events list
  const events = getStoredEvents()
  const newEvents = events.map((ev) => {
    if (ev.id === eventId) {
      return { ...ev, registeredCount: (ev.registeredCount || 0) + 1 }
    }
    return ev
  })
  saveEvents(newEvents)
  return newAttendee
}

// ─── 3. ANNOUNCEMENTS MANAGEMENT ─────────────────────────────────────────────

export function getStoredAnnouncements() {
  try {
    const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(DEMO_ANNOUNCEMENTS))
  } catch {}
  return DEMO_ANNOUNCEMENTS
}

export function saveAnnouncements(announcements) {
  try {
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements))
  } catch (err) {
    console.error('[adminService] Failed to save announcements:', err)
  }
}

export async function getAllAnnouncements() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((a) => ({
          ...a,
          summary: a.description || a.summary,
          published_at: a.event_date || a.created_at?.split('T')[0],
        }))
      }
    } catch (err) {
      console.warn('[adminService] Supabase announcements fetch error:', err)
    }
  }
  const list = getStoredAnnouncements()
  return [...list].sort((a, b) => {
    if (a.is_pinned && !b.is_pinned) return -1
    if (!a.is_pinned && b.is_pinned) return 1
    return new Date(b.published_at || b.date) - new Date(a.published_at || a.date)
  })
}

export async function createAnnouncement(data) {
  const list = getStoredAnnouncements()
  const newAnn = {
    id: `ann-${Date.now()}`,
    title: data.title?.trim() || 'Notice',
    type: data.type || 'campaign',
    category: data.category || 'Solar Notice',
    summary: data.summary?.trim() || '',
    body: data.body?.trim() || data.summary?.trim() || '',
    highlight: data.highlight?.trim() || '',
    is_pinned: Boolean(data.is_pinned),
    published_at: data.published_at || new Date().toISOString().split('T')[0],
    date: data.published_at || new Date().toISOString().split('T')[0],
  }
  const updated = [newAnn, ...list]
  saveAnnouncements(updated)
  return newAnn
}

export async function updateAnnouncement(id, updates) {
  const list = getStoredAnnouncements()
  const updated = list.map((a) => {
    if (a.id === id) {
      return { ...a, ...updates, updated_at: new Date().toISOString() }
    }
    return a
  })
  saveAnnouncements(updated)
  return updated.find((a) => a.id === id)
}

export async function deleteAnnouncement(id) {
  const list = getStoredAnnouncements()
  const filtered = list.filter((a) => a.id !== id)
  saveAnnouncements(filtered)
  return true
}

export async function togglePinAnnouncement(id) {
  const list = getStoredAnnouncements()
  const target = list.find((a) => a.id === id)
  if (!target) return null
  return updateAnnouncement(id, { is_pinned: !target.is_pinned })
}

// ─── 4. EDUCATIONAL GUIDES MANAGEMENT ─────────────────────────────────────────

export function getStoredGuides() {
  try {
    const raw = localStorage.getItem(GUIDES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  try {
    localStorage.setItem(GUIDES_STORAGE_KEY, JSON.stringify(DEMO_GUIDES))
  } catch {}
  return DEMO_GUIDES
}

export function saveGuides(guides) {
  try {
    localStorage.setItem(GUIDES_STORAGE_KEY, JSON.stringify(guides))
  } catch (err) {
    console.error('[adminService] Failed to save guides:', err)
  }
}

export async function getAllGuides() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('solar_guides')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((g) => ({
          ...g,
          summary: g.description || g.summary,
          body: g.content || g.body,
          slug: g.slug || g.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'),
          is_published: true,
        }))
      }
    } catch (err) {
      console.warn('[adminService] Supabase solar_guides fetch error:', err)
    }
  }
  return getStoredGuides()
}

export async function createGuide(data) {
  const list = getStoredGuides()
  const newGuide = {
    id: `guide-${Date.now()}`,
    title: data.title?.trim() || 'New Solar Guide',
    slug: data.slug?.trim() || data.title?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || `solar-guide-${Date.now()}`,
    category: data.category || 'basics',
    readTime: data.readTime || '5 min read',
    summary: data.summary?.trim() || '',
    body: data.body || '',
    is_published: Boolean(data.is_published ?? true),
    created_at: new Date().toISOString(),
  }
  const updated = [newGuide, ...list]
  saveGuides(updated)
  return newGuide
}

export async function updateGuide(id, updates) {
  const list = getStoredGuides()
  const updated = list.map((g) => {
    if (g.id === id) {
      return { ...g, ...updates, updated_at: new Date().toISOString() }
    }
    return g
  })
  saveGuides(updated)
  return updated.find((g) => g.id === id)
}

export async function deleteGuide(id) {
  const list = getStoredGuides()
  const filtered = list.filter((g) => g.id !== id)
  saveGuides(filtered)
  return true
}

export async function togglePublishGuide(id) {
  const list = getStoredGuides()
  const target = list.find((g) => g.id === id)
  if (!target) return null
  return updateGuide(id, { is_published: !target.is_published })
}

// ─── 5. BUILDINGS MANAGEMENT ─────────────────────────────────────────────────

const DEFAULT_BUILDINGS = BUILDING_LEADERBOARD.map((b, idx) => ({
  id: `bld-${idx + 1}`,
  name: b.name,
  address: `${10 + idx * 2} Renewable Way, Tech Corridor`,
<<<<<<< HEAD
  city: 'Bengaluru',
=======
  city: 'Hubballi',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
  total_units: b.households + 6,
  active_solar_units: b.households,
  installed_capacity_kw: b.installedCapacityKw,
}))

export function getStoredBuildings() {
  try {
    const raw = localStorage.getItem(BUILDINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {}
  try {
    localStorage.setItem(BUILDINGS_STORAGE_KEY, JSON.stringify(DEFAULT_BUILDINGS))
  } catch {}
  return DEFAULT_BUILDINGS
}

export function saveBuildings(buildings) {
  try {
    localStorage.setItem(BUILDINGS_STORAGE_KEY, JSON.stringify(buildings))
  } catch (err) {
    console.error('[adminService] Failed to save buildings:', err)
  }
}

export async function getAllBuildings() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('buildings')
        .select('*')
        .order('building_name', { ascending: true })

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((b) => ({
          ...b,
          name: b.building_name,
<<<<<<< HEAD
          address: b.location || 'Bengaluru',
=======
          address: b.location || 'Hubballi',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
          total_units: b.total_units || 24,
          active_solar_units: b.active_solar_units || 6,
        }))
      }
    } catch (err) {
      console.warn('[adminService] Supabase buildings fetch error:', err)
    }
  }
  return getStoredBuildings()
}

export async function createBuilding(data) {
  const list = getStoredBuildings()
  const newB = {
    id: `bld-${Date.now()}`,
    name: data.name?.trim() || 'New Community Building',
    address: data.address?.trim() || 'Green Avenue',
<<<<<<< HEAD
    city: data.city?.trim() || 'Bengaluru',
=======
    city: data.city?.trim() || 'Hubballi',
>>>>>>> 50d5ae593c92274200837e29f7fae68256c4c3ae
    total_units: Number(data.total_units) || 20,
    active_solar_units: Number(data.active_solar_units) || 0,
    installed_capacity_kw: Number(data.installed_capacity_kw) || 0,
    created_at: new Date().toISOString(),
  }
  const updated = [newB, ...list]
  saveBuildings(updated)
  return newB
}

export async function updateBuilding(id, updates) {
  const list = getStoredBuildings()
  const updated = list.map((b) => {
    if (b.id === id) {
      return { ...b, ...updates, updated_at: new Date().toISOString() }
    }
    return b
  })
  saveBuildings(updated)
  return updated.find((b) => b.id === id)
}

export async function deleteBuilding(id) {
  const list = getStoredBuildings()
  const filtered = list.filter((b) => b.id !== id)
  saveBuildings(filtered)
  return true
}

// ─── 6. ADMIN DASHBOARD METRICS AGGREGATOR ───────────────────────────────────

export async function getAdminDashboardOverview() {
  const [users, buildings, records, guides, events, announcements] = await Promise.all([
    getAllUsers(),
    getAllBuildings(),
    getAllRecords(),
    getAllGuides(),
    getAllEvents(),
    getAllAnnouncements(),
  ])

  let totalSolarGenKwh = 0
  let totalSolarUtilKwh = 0
  let totalConsumptionKwh = 0

  records.forEach((r) => {
    totalSolarGenKwh += Number(r.solar_generated_kwh) || 0
    totalSolarUtilKwh += Number(r.solar_utilized_kwh) || 0
    totalConsumptionKwh += Number(r.consumption_kwh) || 0
  })

  const activeWorkshops = events.filter((e) => e.status === 'upcoming').length
  const totalRegistrations = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0)

  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === 'active').length,
    adminUsers: users.filter((u) => u.role === 'admin').length,
    totalBuildings: buildings.length,
    totalRecords: records.length,
    totalSolarGenKwh: parseFloat(totalSolarGenKwh.toFixed(1)),
    totalSolarUtilKwh: parseFloat(totalSolarUtilKwh.toFixed(1)),
    totalConsumptionKwh: parseFloat(totalConsumptionKwh.toFixed(1)),
    totalGuides: guides.length,
    publishedGuides: guides.filter((g) => g.is_published).length,
    activeWorkshops,
    totalRegistrations,
    totalAnnouncements: announcements.length,
    recentRecords: records.slice(0, 5),
  }
}


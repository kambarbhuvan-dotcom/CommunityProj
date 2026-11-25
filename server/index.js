/**
 * SolarConnect local API.
 * JSON file database for the presentation when Supabase is not configured.
 *
 * Demo accounts (created on first run):
 *   admin@solarconnect.local / Admin@123
 *   priya@solarconnect.local / Resident@123
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const DB_PATH = path.join(DATA_DIR, 'db.json')
const PORT = Number(process.env.PORT || 4000)

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
  return `${salt}:${hash}`
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(':')) return false
  const [salt, hash] = stored.split(':')
  const check = crypto.createHash('sha256').update(`${salt}:${password}`).digest('hex')
  const a = Buffer.from(hash)
  const b = Buffer.from(check)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

function isoDate(d) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function id(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString('hex')}`
}

function buildLogs(userId, days = 40) {
  const logs = []
  const now = new Date()
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = isoDate(d)
    const month = d.getMonth()
    const seasonal = month >= 2 && month <= 9 ? 1.12 : 0.92
    const seed = (d.getDate() * 17 + (month + 1) * 31) % 100
    const weather = 0.78 + (seed / 100) * 0.4
    const gen = parseFloat(Math.max(8, 21.5 * seasonal * weather).toFixed(2))
    const weekend = d.getDay() === 0 || d.getDay() === 6 ? 2.8 : 0
    const consumption = parseFloat(Math.max(10, 16.4 + weekend + ((seed % 12) - 5) * 0.35).toFixed(2))
    const utilized = parseFloat(Math.min(gen, consumption * 0.86).toFixed(2))
    const gridExport = parseFloat(Math.max(0, gen - utilized).toFixed(2))
    const gridImport = parseFloat(Math.max(0, consumption - utilized).toFixed(2))
    logs.push({
      id: `log-${userId}-${dateStr}`,
      user_id: userId,
      log_date: dateStr,
      solar_generated_kwh: gen,
      total_consumption_kwh: consumption,
      consumption_kwh: consumption,
      solar_utilized_kwh: utilized,
      grid_export_kwh: gridExport,
      grid_import_kwh: gridImport,
      battery_charge_kwh: 0,
      battery_discharge_kwh: 0,
      notes: i === 0 ? 'Logged from the rooftop meter this morning' : (seed % 11 === 0 ? 'Clear sky, panels washed' : ''),
      created_at: new Date(d).toISOString(),
    })
  }
  return logs
}

function seed() {
  const buildings = [
    { id: 'bld-1', name: 'Sunrise Apartments Block A', building_name: 'Sunrise Apartments Block A', address: '12 Vidyanagar Main Road', city: 'Hubballi', location: '12 Vidyanagar Main Road, Hubballi', total_units: 24, active_solar_units: 14, installed_capacity_kw: 48 },
    { id: 'bld-2', name: 'Green Valley Eco-Homes', building_name: 'Green Valley Eco-Homes', address: '8 Unkal Lake View', city: 'Hubballi', location: '8 Unkal Lake View, Hubballi', total_units: 18, active_solar_units: 12, installed_capacity_kw: 42.5 },
    { id: 'bld-3', name: 'Sunrise Apartments Block B', building_name: 'Sunrise Apartments Block B', address: '14 Vidyanagar Main Road', city: 'Hubballi', location: '14 Vidyanagar Main Road, Hubballi', total_units: 20, active_solar_units: 12, installed_capacity_kw: 36 },
    { id: 'bld-4', name: 'Solar Heights Residency', building_name: 'Solar Heights Residency', address: '3 Gokul Road', city: 'Hubballi', location: '3 Gokul Road, Hubballi', total_units: 16, active_solar_units: 10, installed_capacity_kw: 28 },
  ]

  const users = [
    {
      id: 'usr-admin-1',
      full_name: 'Community Administrator',
      email: 'admin@solarconnect.local',
      password_hash: hashPassword('Admin@123'),
      unit_number: 'A-101',
      building_id: 'bld-1',
      role: 'admin',
      status: 'active',
      panel_count: 12,
      panel_capacity_kw: 6,
      created_at: '2026-06-01T08:00:00.000Z',
    },
    {
      id: 'usr-resident-1',
      full_name: 'Solar Resident',
      email: 'resident@solarconnect.local',
      password_hash: hashPassword('Resident@123'),
      unit_number: 'B-204',
      building_id: 'bld-1',
      role: 'resident',
      status: 'active',
      panel_count: 0,
      panel_capacity_kw: 0,
      created_at: '2026-07-12T08:00:00.000Z',
    },
    {
      id: 'usr-resident-2',
      full_name: 'Vikram Joshi',
      email: 'vikram.joshi@example.com',
      password_hash: hashPassword('Resident@123'),
      unit_number: 'C-302',
      building_id: 'bld-2',
      role: 'resident',
      status: 'active',
      panel_count: 10,
      panel_capacity_kw: 5,
      created_at: '2026-08-02T08:00:00.000Z',
    },
    {
      id: 'usr-resident-3',
      full_name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@example.com',
      password_hash: hashPassword('Resident@123'),
      unit_number: 'A-202',
      building_id: 'bld-3',
      role: 'resident',
      status: 'active',
      panel_count: 6,
      panel_capacity_kw: 3,
      created_at: '2026-08-18T08:00:00.000Z',
    },
    {
      id: 'usr-resident-4',
      full_name: 'Meera Patel',
      email: 'meera.patel@example.com',
      password_hash: hashPassword('Resident@123'),
      unit_number: 'B-110',
      building_id: 'bld-4',
      role: 'resident',
      status: 'suspended',
      panel_count: 4,
      panel_capacity_kw: 2,
      created_at: '2026-09-04T08:00:00.000Z',
    },
  ]

  const setups = {
    'usr-admin-1': {
      id: 'setup-usr-admin-1',
      user_id: 'usr-admin-1',
      system_capacity_kw: 6,
      panel_type: 'Monocrystalline',
      panel_count: 12,
      installation_date: '2026-04-18',
      city_location: 'Hubballi',
      inverter_capacity_kw: 5,
      has_battery_storage: false,
      battery_capacity_kwh: 0,
      system_type: 'on_grid',
    },
  }

  const settings = {}
  for (const u of users) {
    settings[u.id] = {
      user_id: u.id,
      electricity_tariff_inr: 7.5,
      grid_emission_factor: 0.82,
      avg_daily_consumption_kwh: 16,
      avg_monthly_consumption_kwh: 480,
      household_members: 4,
      electricity_provider: 'HESCOM',
    }
  }

  const logs = [
    ...buildLogs('usr-admin-1', 30),
  ]

  const records = []
  const names = buildings.map((b) => b.building_name)
  for (let i = 0; i < 18; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const building = names[i % names.length]
    const gen = parseFloat((18 + (i % 7) * 1.4).toFixed(2))
    const con = parseFloat((14 + (i % 5)).toFixed(2))
    const uti = parseFloat(Math.min(gen, con * 0.8).toFixed(2))
    records.push({
      id: `rec-seed-${i + 1}`,
      building_id: buildings[i % buildings.length].id,
      building,
      recorded_date: isoDate(d),
      log_date: isoDate(d),
      solar_generated: gen,
      solar_generated_kwh: gen,
      electricity_consumed: con,
      consumption_kwh: con,
      solar_utilized: uti,
      solar_utilized_kwh: uti,
      grid_export_kwh: parseFloat(Math.max(0, gen - uti).toFixed(2)),
      grid_import_kwh: parseFloat(Math.max(0, con - uti).toFixed(2)),
      notes: i === 0 ? 'Community meter verified by the admin desk' : '',
      created_by: 'usr-admin-1',
      created_at: d.toISOString(),
    })
  }

  return {
    users,
    sessions: [],
    buildings,
    logs,
    records,
    setups,
    settings,
    guides: [
      {
        id: 'g1', slug: 'solar-energy-basics', category: 'basics', is_published: true, readTime: '4 min read',
        title: 'Understanding Solar Energy Basics',
        summary: 'How rooftop panels turn Hubballi sunlight into household electricity.',
        body: 'Photovoltaic cells convert sunlight into direct current. An inverter turns that into the alternating current your home uses. What you consume on site is what reduces the HESCOM bill.',
      },
      {
        id: 'g2', slug: 'pm-surya-ghar', category: 'schemes', is_published: true, readTime: '6 min read',
        title: 'PM Surya Ghar: Muft Bijli Yojana',
        summary: 'Central subsidy path for residential rooftop solar and the documents residents usually need.',
        body: 'Households can apply on the national portal, upload electricity-bill and roof details, and track vendor installation. Subsidy is credited after commissioning and inspection.',
      },
      {
        id: 'g3', slug: 'net-metering', category: 'tariffs', is_published: true, readTime: '5 min read',
        title: 'Net Metering and Bill Savings',
        summary: 'Why SolarConnect counts savings from solar electricity you actually use at home.',
        body: 'Exported units and self-consumed units are not worth the same on every tariff. This portal estimates savings from solar utilized inside the home at your HESCOM slab.',
      },
      {
        id: 'g4', slug: 'panel-care', category: 'maintenance', is_published: false, readTime: '3 min read',
        title: 'Monsoon Panel Care',
        summary: 'Draft guide for water-efficient washing and earthing checks.',
        body: 'Rinse dust after dry spells, avoid abrasive pads, and ask the association electrician to check earthing before the heavy rains.',
      },
    ],
    announcements: [
      {
        id: 'ann1', title: 'Clean Energy Week terrace walk', is_pinned: true, type: 'campaign',
        category: 'Solar Awareness Campaign', published_at: '2026-11-20', date: '2026-11-20',
        summary: 'Open rooftop walkthrough of live Mono-PERC and TOPCon systems.',
        body: 'Meet at the Block A terrace at 5 PM. Residents who are still deciding on installation can see working inverters and ask the association engineer questions.',
        highlight: 'Open to all residents',
      },
      {
        id: 'ann2', title: 'Panel cleaning drive', is_pinned: true, type: 'workshop',
        category: 'Conservation', published_at: '2026-11-18', date: '2026-11-18',
        summary: 'Saturday 7 AM on the common terrace. Supplies provided.',
        body: 'A thin dust layer can cut output through the dry months. Bring closed shoes. The association will provide wipers and restricted water use.',
        highlight: 'Block A and Block B terraces',
      },
      {
        id: 'ann3', title: 'Community crossed 24,000 kWh', is_pinned: false, type: 'achievement',
        category: 'Community Achievement', published_at: '2026-11-01', date: '2026-11-01',
        summary: 'Collective rooftop generation has avoided about 15 tonnes of grid CO₂.',
        body: 'Thank you for logging readings. The next target is a full month where every solar household files at least 20 daily logs.',
        highlight: 'Celebrated at the residents council',
      },
    ],
    events: [
      {
        id: 'evt-1', title: 'Solar Inverter Health & Safety Inspection Camp', category: 'Workshop',
        date: 'Saturday, 28 Nov 2026', time: '10:00 AM – 1:00 PM',
        location: 'Community Clubhouse & Block A Terrace', facilitator: 'Technical Advisory Committee',
        registeredCount: 4, capacity: 40, status: 'upcoming',
        description: 'Free earthing check and inverter firmware audit for systems older than one year.',
      },
      {
        id: 'evt-2', title: 'PM Surya Ghar feasibility clinic', category: 'Awareness Campaign',
        date: 'Sunday, 06 Dec 2026', time: '11:00 AM – 12:30 PM',
        location: 'Central Community Hall', facilitator: 'DISCOM empanelled engineer',
        registeredCount: 2, capacity: 50, status: 'upcoming',
        description: 'Bring last month’s electricity bill. We will walk through subsidy documents and payback.',
      },
      {
        id: 'evt-3', title: 'Water-efficient panel washing clinic', category: 'Conservation',
        date: 'Saturday, 12 Dec 2026', time: '7:30 AM – 9:00 AM',
        location: 'Block B Common Terrace', facilitator: 'Green Maintenance Volunteers',
        registeredCount: 1, capacity: 25, status: 'upcoming',
        description: 'Microfiber wiper technique that cleans glass without wasting potable water.',
      },
    ],
    registrations: {
      'evt-1': [
        { id: 'reg-1', name: 'Community Administrator', unit: 'A-101', email: 'admin@solarconnect.local', registered_at: '2026-11-18T10:30:00.000Z' },
        { id: 'reg-2', name: 'Solar Resident', unit: 'B-204', email: 'resident@solarconnect.local', registered_at: '2026-11-19T14:15:00.000Z' },
      ],
    },
    achievements: [
      { id: 'a1', title: 'First kWh Generated', description: 'The community logged its first solar kilowatt-hour.', icon: 'Sun', achieved_at: '2026-06-01', threshold_kwh: 1 },
      { id: 'a2', title: '100 kWh Milestone', description: 'Community generation crossed 100 kWh.', icon: 'Trophy', achieved_at: '2026-06-14', threshold_kwh: 100 },
      { id: 'a3', title: '1 MWh Club', description: 'Community crossed 1,000 kWh of solar generation.', icon: 'Zap', achieved_at: '2026-08-05', threshold_kwh: 1000 },
      { id: 'a4', title: '50 Trees Equivalent', description: 'CO₂ avoided matches about 50 trees a year.', icon: 'Leaf', achieved_at: '2026-09-20', threshold_kwh: null },
      { id: 'a5', title: '10 MWh Powerhouse', description: 'Community solar crossed 10 MWh.', icon: 'Award', achieved_at: '2026-11-01', threshold_kwh: 10000 },
    ],
  }
}

function loadDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    const fresh = seed()
    fs.writeFileSync(DB_PATH, JSON.stringify(fresh, null, 2))
    return fresh
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
}

let db = loadDb()

function saveDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  const tmp = `${DB_PATH}.tmp`
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2))
  fs.renameSync(tmp, DB_PATH)
}

function publicUser(user) {
  if (!user) return null
  const building = db.buildings.find((b) => b.id === user.building_id) || null
  return {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { full_name: user.full_name },
    },
    profile: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      unit_number: user.unit_number,
      building_id: user.building_id,
      role: user.role,
      status: user.status,
      panel_count: user.panel_count,
      panel_capacity_kw: user.panel_capacity_kw,
    },
    building: building
      ? {
          id: building.id,
          building_name: building.building_name || building.name,
          location: building.location || `${building.address}, ${building.city}`,
        }
      : null,
  }
}

function userRow(user) {
  const building = db.buildings.find((b) => b.id === user.building_id)
  return {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    unit_number: user.unit_number,
    building_id: user.building_id,
    building_name: building?.building_name || building?.name || 'Unassigned',
    panel_count: user.panel_count,
    panel_capacity_kw: user.panel_capacity_kw,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  }
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      if (!chunks.length) return resolve({})
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function send(res, status, payload) {
  const body = JSON.stringify(payload)
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function currentUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) return null
  const session = db.sessions.find((s) => s.token === token)
  if (!session) return null
  return db.users.find((u) => u.id === session.userId) || null
}

function requireUser(req, res) {
  const user = currentUser(req)
  if (!user) {
    send(res, 401, { error: 'Sign in required.' })
    return null
  }
  if (user.status === 'suspended') {
    send(res, 403, { error: 'This account is suspended. Contact the community admin.' })
    return null
  }
  return user
}

function normalizeRecord(input, existing = {}) {
  const gen = Number(input.solar_generated ?? input.solar_generated_kwh ?? existing.solar_generated_kwh) || 0
  const con = Number(input.electricity_consumed ?? input.consumption_kwh ?? existing.consumption_kwh) || 0
  const uti = Number(input.solar_utilized ?? input.solar_utilized_kwh ?? existing.solar_utilized_kwh) || 0
  const dateStr = input.recorded_date || input.log_date || existing.log_date
  const building = input.building || existing.building || 'Sunrise Apartments Block A'
  return {
    ...existing,
    id: existing.id,
    building_id: input.building_id || existing.building_id || null,
    building,
    recorded_date: dateStr,
    log_date: dateStr,
    solar_generated: parseFloat(gen.toFixed(2)),
    solar_generated_kwh: parseFloat(gen.toFixed(2)),
    electricity_consumed: parseFloat(con.toFixed(2)),
    consumption_kwh: parseFloat(con.toFixed(2)),
    solar_utilized: parseFloat(uti.toFixed(2)),
    solar_utilized_kwh: parseFloat(uti.toFixed(2)),
    grid_export_kwh: parseFloat(Math.max(0, gen - uti).toFixed(2)),
    grid_import_kwh: parseFloat(Math.max(0, con - uti).toFixed(2)),
    notes: input.notes?.trim?.() ?? input.notes ?? existing.notes ?? '',
    created_by: existing.created_by,
    created_at: existing.created_at,
  }
}

const routes = []
function route(method, pattern, handler) {
  routes.push({ method, pattern, handler })
}

function matchRoute(method, pathname) {
  for (const entry of routes) {
    if (entry.method !== method) continue
    const a = entry.pattern.split('/')
    const b = pathname.split('/')
    if (a.length !== b.length) continue
    const params = {}
    let ok = true
    for (let i = 0; i < a.length; i++) {
      if (a[i].startsWith(':')) params[a[i].slice(1)] = decodeURIComponent(b[i])
      else if (a[i] !== b[i]) ok = false
    }
    if (ok) return { handler: entry.handler, params }
  }
  return null
}

route('GET', '/api/health', async (_req, res) => {
  send(res, 200, { ok: true, service: 'solarconnect-local', users: db.users.length, records: db.records.length })
})

route('POST', '/api/auth/register', async (req, res) => {
  const body = req.body || {}
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (!email || !email.includes('@')) return send(res, 400, { error: 'Enter a valid email address.' })
  if (password.length < 6) return send(res, 400, { error: 'Password must be at least 6 characters.' })
  if (db.users.some((u) => u.email === email)) return send(res, 409, { error: 'An account with this email already exists.' })
  const user = {
    id: id('usr'),
    full_name: String(body.full_name || 'Resident').trim(),
    email,
    password_hash: hashPassword(password),
    unit_number: String(body.unit_number || '').trim(),
    building_id: body.building_id || db.buildings[0]?.id || null,
    role: 'resident',
    status: 'active',
    panel_count: Number(body.panel_count) || 0,
    panel_capacity_kw: Number(body.panel_capacity_kw) || 0,
    created_at: new Date().toISOString(),
  }
  db.users.unshift(user)
  db.settings[user.id] = {
    user_id: user.id,
    electricity_tariff_inr: 7.5,
    grid_emission_factor: 0.82,
    avg_daily_consumption_kwh: null,
    avg_monthly_consumption_kwh: null,
    household_members: 4,
    electricity_provider: 'HESCOM',
  }
  const token = crypto.randomBytes(24).toString('hex')
  db.sessions.push({ token, userId: user.id, created_at: new Date().toISOString() })
  saveDb()
  send(res, 201, { token, ...publicUser(user) })
})

route('POST', '/api/auth/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const user = db.users.find((u) => u.email === email)
  if (!user || !verifyPassword(password, user.password_hash)) {
    return send(res, 401, { error: 'Email or password is incorrect.' })
  }
  if (user.status === 'suspended') {
    return send(res, 403, { error: 'This account is suspended. Contact the community admin.' })
  }
  const token = crypto.randomBytes(24).toString('hex')
  db.sessions.push({ token, userId: user.id, created_at: new Date().toISOString() })
  saveDb()
  send(res, 200, { token, ...publicUser(user) })
})

route('POST', '/api/auth/logout', async (req, res) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  db.sessions = db.sessions.filter((s) => s.token !== token)
  saveDb()
  send(res, 200, { ok: true })
})

route('GET', '/api/auth/me', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  send(res, 200, publicUser(user))
})

route('PATCH', '/api/profile', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const allowed = ['full_name', 'unit_number', 'building_id', 'panel_count', 'panel_capacity_kw']
  for (const key of allowed) {
    if (req.body?.[key] !== undefined) user[key] = req.body[key]
  }
  saveDb()
  send(res, 200, publicUser(user))
})

route('GET', '/api/logs', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const requested = req.query.userId
  const userId = user.role === 'admin' && requested ? requested : user.id
  if (user.role !== 'admin' && requested && requested !== user.id) {
    return send(res, 403, { error: 'You can only view your own energy logs.' })
  }
  const logs = db.logs
    .filter((l) => l.user_id === userId)
    .sort((a, b) => (a.log_date < b.log_date ? 1 : -1))
  send(res, 200, logs)
})

route('POST', '/api/logs', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const body = req.body || {}
  const dateStr = body.log_date
  if (!dateStr) return send(res, 400, { error: 'log_date is required.' })

  const gen = Number(body.solar_generated_kwh) || 0
  const con = Number(body.total_consumption_kwh) || 0
  const exp = Number(body.grid_export_kwh) || 0
  const imp = Number(body.grid_import_kwh) || 0

  if (gen < 0 || con < 0 || exp < 0 || imp < 0) {
    return send(res, 400, { error: 'Energy readings cannot be negative numbers.' })
  }
  if (exp > gen) {
    return send(res, 400, { error: 'Grid exported cannot exceed solar energy generated.' })
  }
  if (imp > con) {
    return send(res, 400, { error: 'Grid imported cannot exceed total electricity consumed.' })
  }

  const rawSelfUsed = Math.min(gen - exp, con - imp)
  const selfUsed = Math.max(0, Math.min(gen, Math.min(con, rawSelfUsed)))
  body.solar_utilized_kwh = parseFloat(selfUsed.toFixed(2))

  if (body.id) {
    const existing = db.logs.find((l) => l.id === body.id && (user.role === 'admin' || l.user_id === user.id))
    if (!existing) return send(res, 404, { error: 'Log not found.' })
    Object.assign(existing, body, { user_id: existing.user_id, id: existing.id })
    saveDb()
    return send(res, 200, existing)
  }
  const duplicate = db.logs.find((l) => l.user_id === user.id && l.log_date === dateStr)
  if (duplicate) return send(res, 409, { error: 'A log for this date already exists. Edit it from My Energy Records.' })
  const log = { id: id('log'), user_id: user.id, created_at: new Date().toISOString(), ...body }
  db.logs.unshift(log)
  saveDb()
  send(res, 201, log)
})

route('DELETE', '/api/logs/:id', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const before = db.logs.length
  db.logs = db.logs.filter((l) => !(l.id === req.params.id && (user.role === 'admin' || l.user_id === user.id)))
  if (db.logs.length === before) return send(res, 404, { error: 'Log not found.' })
  saveDb()
  send(res, 200, { ok: true })
})

route('DELETE', '/api/logs', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  db.logs = db.logs.filter((l) => l.user_id !== user.id)
  delete db.setups[user.id]
  saveDb()
  send(res, 200, { ok: true })
})

route('GET', '/api/setup', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  send(res, 200, db.setups[user.id] || null)
})

route('PUT', '/api/setup', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const current = db.setups[user.id] || { id: `setup-${user.id}`, user_id: user.id, created_at: new Date().toISOString() }
  db.setups[user.id] = { ...current, ...req.body, id: current.id, user_id: user.id, updated_at: new Date().toISOString() }
  if (req.body.panel_count !== undefined) user.panel_count = Number(req.body.panel_count) || 0
  if (req.body.system_capacity_kw !== undefined) user.panel_capacity_kw = Number(req.body.system_capacity_kw) || 0
  saveDb()
  send(res, 200, db.setups[user.id])
})

route('GET', '/api/settings', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  send(res, 200, db.settings[user.id] || { user_id: user.id, electricity_tariff_inr: 7.5, grid_emission_factor: 0.82, household_members: 4, electricity_provider: '' })
})

route('PUT', '/api/settings', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  db.settings[user.id] = { ...(db.settings[user.id] || {}), ...req.body, user_id: user.id, updated_at: new Date().toISOString() }
  saveDb()
  send(res, 200, db.settings[user.id])
})

route('GET', '/api/records', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const records = [...db.records].sort((a, b) => (a.log_date < b.log_date ? 1 : -1))
  send(res, 200, records)
})

route('POST', '/api/records', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const body = req.body || {}
  if (body.id) {
    const existing = db.records.find((r) => r.id === body.id)
    if (!existing) return send(res, 404, { error: 'Record not found.' })
    Object.assign(existing, normalizeRecord(body, existing))
    saveDb()
    return send(res, 200, existing)
  }
  const record = normalizeRecord(body, {
    id: id('rec'),
    created_by: user.id,
    created_at: new Date().toISOString(),
  })
  record.id = record.id || id('rec')
  db.records.unshift(record)
  saveDb()
  send(res, 201, record)
})

route('DELETE', '/api/records/:id', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  db.records = db.records.filter((r) => r.id !== req.params.id)
  saveDb()
  send(res, 200, { ok: true })
})

route('GET', '/api/buildings', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  send(res, 200, db.buildings)
})

route('POST', '/api/buildings', async (req, res) => {
  const user = requireUser(req, res)
  if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
  const body = req.body || {}
  const name = String(body.name || body.building_name || 'New building').trim()
  const building = {
    id: id('bld'),
    name,
    building_name: name,
    address: body.address || '',
    city: body.city || 'Hubballi',
    location: `${body.address || ''}, ${body.city || 'Hubballi'}`.replace(/^, /, ''),
    total_units: Number(body.total_units) || 0,
    active_solar_units: Number(body.active_solar_units) || 0,
    installed_capacity_kw: Number(body.installed_capacity_kw) || 0,
    created_at: new Date().toISOString(),
  }
  db.buildings.unshift(building)
  saveDb()
  send(res, 201, building)
})

route('PUT', '/api/buildings/:id', async (req, res) => {
  const user = requireUser(req, res)
  if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
  const building = db.buildings.find((b) => b.id === req.params.id)
  if (!building) return send(res, 404, { error: 'Building not found.' })
  Object.assign(building, req.body)
  if (req.body.name) building.building_name = req.body.name
  saveDb()
  send(res, 200, building)
})

route('DELETE', '/api/buildings/:id', async (req, res) => {
  const user = requireUser(req, res)
  if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
  db.buildings = db.buildings.filter((b) => b.id !== req.params.id)
  saveDb()
  send(res, 200, { ok: true })
})

route('GET', '/api/users', async (req, res) => {
  const user = requireUser(req, res)
  if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
  send(res, 200, db.users.map(userRow))
})

route('POST', '/api/users', async (req, res) => {
  const user = requireUser(req, res)
  if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
  const body = req.body || {}
  const email = String(body.email || '').trim().toLowerCase()
  if (db.users.some((u) => u.email === email)) return send(res, 409, { error: 'That email is already registered.' })
  const created = {
    id: id('usr'),
    full_name: body.full_name || 'New Resident',
    email,
    password_hash: hashPassword(body.password || 'Resident@123'),
    unit_number: body.unit_number || '',
    building_id: body.building_id || db.buildings[0]?.id,
    role: body.role === 'admin' ? 'admin' : 'resident',
    status: 'active',
    panel_count: Number(body.panel_count) || 0,
    panel_capacity_kw: Number(body.panel_capacity_kw) || 0,
    created_at: new Date().toISOString(),
  }
  db.users.unshift(created)
  saveDb()
  send(res, 201, userRow(created))
})

route('PATCH', '/api/users/:id', async (req, res) => {
  const actor = requireUser(req, res)
  if (!actor || actor.role !== 'admin') return actor && send(res, 403, { error: 'Admin only.' })
  const target = db.users.find((u) => u.id === req.params.id)
  if (!target) return send(res, 404, { error: 'User not found.' })
  if (target.id === actor.id && req.body.role && req.body.role !== 'admin') {
    return send(res, 400, { error: 'Security policy violation: Administrators cannot revoke their own admin privileges.' })
  }
  if (target.id === actor.id && req.body.status === 'suspended') {
    return send(res, 400, { error: 'Security policy violation: You cannot suspend your own administrative account.' })
  }
  const fields = ['full_name', 'email', 'unit_number', 'building_id', 'role', 'status', 'panel_count', 'panel_capacity_kw']
  for (const key of fields) {
    if (req.body?.[key] !== undefined) target[key] = req.body[key]
  }
  saveDb()
  send(res, 200, userRow(target))
})

route('DELETE', '/api/users/:id', async (req, res) => {
  const actor = requireUser(req, res)
  if (!actor || actor.role !== 'admin') return actor && send(res, 403, { error: 'Admin only.' })
  if (req.params.id === actor.id) {
    return send(res, 400, { error: 'Security policy violation: You cannot delete your own account.' })
  }
  db.users = db.users.filter((u) => u.id !== req.params.id)
  db.sessions = db.sessions.filter((s) => s.userId !== req.params.id)
  saveDb()
  send(res, 200, { ok: true })
})

function collectionRoutes(name) {
  route('GET', `/api/${name}`, async (req, res) => {
    const user = requireUser(req, res)
    if (!user) return
    send(res, 200, db[name])
  })
  route('POST', `/api/${name}`, async (req, res) => {
    const user = requireUser(req, res)
    if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
    const item = { id: id(name.slice(0, 3)), created_at: new Date().toISOString(), ...(req.body || {}) }
    db[name].unshift(item)
    saveDb()
    send(res, 201, item)
  })
  route('PUT', `/api/${name}/:id`, async (req, res) => {
    const user = requireUser(req, res)
    if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
    const item = db[name].find((x) => x.id === req.params.id)
    if (!item) return send(res, 404, { error: 'Not found.' })
    Object.assign(item, req.body, { id: item.id })
    saveDb()
    send(res, 200, item)
  })
  route('DELETE', `/api/${name}/:id`, async (req, res) => {
    const user = requireUser(req, res)
    if (!user || user.role !== 'admin') return user && send(res, 403, { error: 'Admin only.' })
    db[name] = db[name].filter((x) => x.id !== req.params.id)
    saveDb()
    send(res, 200, { ok: true })
  })
}

collectionRoutes('guides')
collectionRoutes('announcements')
collectionRoutes('events')
collectionRoutes('achievements')

route('GET', '/api/events/:id/registrations', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  send(res, 200, db.registrations[req.params.id] || [])
})

route('POST', '/api/events/:id/registrations', async (req, res) => {
  const user = requireUser(req, res)
  if (!user) return
  const list = db.registrations[req.params.id] || []
  const attendee = {
    id: id('reg'),
    name: req.body?.name || user.full_name,
    unit: req.body?.unit || user.unit_number,
    email: req.body?.email || user.email,
    registered_at: new Date().toISOString(),
  }
  db.registrations[req.params.id] = [attendee, ...list]
  const event = db.events.find((e) => e.id === req.params.id)
  if (event) event.registeredCount = (event.registeredCount || 0) + 1
  saveDb()
  send(res, 201, attendee)
})

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    })
    return res.end()
  }
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  const match = matchRoute(req.method, url.pathname)
  if (!match) return send(res, 404, { error: 'Not found.' })
  try {
    req.query = Object.fromEntries(url.searchParams.entries())
    req.params = match.params
    if (req.method !== 'GET' && req.method !== 'DELETE') req.body = await readBody(req)
    await match.handler(req, res)
  } catch (err) {
    console.error(err)
    if (!res.headersSent) send(res, 500, { error: 'Server error.' })
  }
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`SolarConnect API listening on http://127.0.0.1:${PORT}`)
})

/**
 * Client for the local SolarConnect API (server/index.js).
 * Used when Supabase is not configured. Tests stay on localStorage.
 */
import { isSupabaseConfigured } from './supabase'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:4000'
const TOKEN_KEY = 'solarconnect_api_token'

export function getApiToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setApiToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore quota / private mode */
  }
}

let readyPromise = null

export function localBackendReady() {
  if (typeof window === 'undefined') return Promise.resolve(false)
  if (import.meta.env?.VITEST) return Promise.resolve(false)
  if (isSupabaseConfigured) return Promise.resolve(false)
  if (!readyPromise) {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 1500)
    readyPromise = fetch(`${API_BASE}/api/health`, { signal: ctrl.signal })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => clearTimeout(timer))
  }
  return readyPromise
}

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getApiToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`)
    err.status = res.status
    throw err
  }
  return data
}

/**
 * supabase.js
 *
 * Reusable Supabase client for SolarConnect.
 * Uses environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
 *
 * SECURITY:
 *   - Only uses the public ANON key in client-side code.
 *   - NEVER expose the SERVICE_ROLE key here or anywhere in the frontend.
 *   - Row Level Security (RLS) policies enforce data access rules in PostgreSQL.
 */
import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check whether real Supabase credentials have been configured
export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('placeholder') &&
  rawUrl.startsWith('https://') &&
  rawKey !== 'placeholder_anon_key' &&
  rawKey.length > 20
)

const supabaseUrl = isSupabaseConfigured ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = isSupabaseConfigured ? rawKey : 'placeholder_anon_key'

if (!isSupabaseConfigured) {
  console.info(
    '[SolarConnect] Supabase is not configured or is using placeholder credentials. ' +
    'The app is running with local resilient storage. Set VITE_SUPABASE_URL and ' +
    'VITE_SUPABASE_ANON_KEY in your .env file to enable live cloud database sync.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

/**
 * Health check to verify connection to Supabase database.
 * @returns {Promise<{ connected: boolean, error: string | null }>}
 */
export async function checkSupabaseConnection() {
  if (!isSupabaseConfigured) {
    return {
      connected: false,
      error: 'Supabase credentials not configured in .env',
    }
  }

  try {
    const { error } = await supabase
      .from('buildings')
      .select('id', { head: true, count: 'exact' })

    if (error) {
      return { connected: false, error: error.message }
    }

    return { connected: true, error: null }
  } catch (err) {
    return { connected: false, error: err.message || 'Network connection failed' }
  }
}

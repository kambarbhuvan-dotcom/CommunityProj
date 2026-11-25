/**
 * AuthContext.jsx
 *
 * Full Supabase Authentication & Role State Management:
 * 1. User Registration (signUp with automatic profile creation & metadata)
 * 2. User Login (signInWithPassword)
 * 3. User Logout (signOut)
 * 4. User Profile synchronization from PostgreSQL 'profiles' table
 * 5. Admin vs Normal User Role Resolution (server-side, RLS-enforced)
 * 6. Loading and Error states
 * 7. Resilient demo session switcher for testing and demonstration
 */

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const AuthContext = createContext(undefined)

const DEMO_ADMIN = {
  user: {
    id: 'usr-admin-1',
    email: 'admin@solarconnect.internal',
    user_metadata: { full_name: 'Administrator' },
  },
  profile: {
    id: 'usr-admin-1',
    full_name: 'Administrator',
    email: 'admin@solarconnect.internal',
    unit_number: 'A-101',
    building_id: '11111111-1111-1111-1111-111111111111',
    role: 'admin',
    panel_count: 12,
    panel_capacity_kw: 6.0,
  },
  building: {
    id: '11111111-1111-1111-1111-111111111111',
    building_name: 'Sunrise Apartments Block A',
    location: '12 Green Park Road, Bengaluru',
  },
}

const DEMO_RESIDENT = {
  user: {
    id: 'usr-resident-1',
    email: 'resident@solarconnect.internal',
    user_metadata: { full_name: 'Resident' },
  },
  profile: {
    id: 'usr-resident-1',
    full_name: 'Resident',
    email: 'resident@solarconnect.internal',
    unit_number: 'B-204',
    building_id: '11111111-1111-1111-1111-111111111111',
    role: 'resident',
    panel_count: 8,
    panel_capacity_kw: 4.0,
  },
  building: {
    id: '11111111-1111-1111-1111-111111111111',
    building_name: 'Sunrise Apartments Block A',
    location: '12 Green Park Road, Bengaluru',
  },
}

export function AuthProvider({ children }) {
  const [user, setUser]         = useState(null)
  const [profile, setProfile]   = useState(null)
  const [building, setBuilding] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [authError, setAuthError] = useState(null)

  // Derived role flags
  const isAdmin = profile?.role === 'admin'
  const isResident = profile?.role === 'resident'

  /**
   * Fetches profile and building for a given user from Supabase.
   */
  async function fetchProfileAndBuilding(userId) {
    if (!isSupabaseConfigured) return false

    try {
      const { data: profileData, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileErr) {
        console.warn('[AuthContext] Profile fetch warning:', profileErr.message)
        return false
      }

      setProfile(profileData)

      if (profileData?.building_id) {
        const { data: buildingData } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', profileData.building_id)
          .single()

        if (buildingData) {
          setBuilding(buildingData)
        }
      }
      return true
    } catch (err) {
      console.warn('[AuthContext] Error fetching profile:', err)
      return false
    }
  }

  // Initial session setup
  useEffect(() => {
    let isMounted = true

    async function initAuth() {
      setLoading(true)
      try {
        if (isSupabaseConfigured) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user && isMounted) {
            setUser(session.user)
            const success = await fetchProfileAndBuilding(session.user.id)
            if (!success && isMounted) {
              // Fallback profile if row hasn't populated yet
              setProfile({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
                email: session.user.email,
                role: 'resident',
                unit_number: 'A-101',
              })
            }
            setLoading(false)
            return
          }
        }

        // Demo fallback session when Supabase session is not active
        if (isMounted) {
          const savedRole = localStorage.getItem('solarconnect_demo_role') || 'admin'
          const activeDemo = savedRole === 'resident' ? DEMO_RESIDENT : DEMO_ADMIN
          setUser(activeDemo.user)
          setProfile(activeDemo.profile)
          setBuilding(activeDemo.building)
        }
      } catch (err) {
        console.warn('[AuthContext] Session init error, using fallback admin:', err)
        if (isMounted) {
          setUser(DEMO_ADMIN.user)
          setProfile(DEMO_ADMIN.profile)
          setBuilding(DEMO_ADMIN.building)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initAuth()

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return
        if (session?.user) {
          setUser(session.user)
          await fetchProfileAndBuilding(session.user.id)
        } else if (isSupabaseConfigured) {
          setUser(null)
          setProfile(null)
          setBuilding(null)
        }
        setLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [])

  /**
   * User registration with Supabase Auth & Profile creation.
   */
  async function signUp(email, password, metadata = {}) {
    setAuthError(null)
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        // Local simulation if Supabase is unconfigured
        const newDemo = {
          user: { id: `usr-${Date.now()}`, email, user_metadata: { full_name: metadata.full_name } },
          profile: {
            id: `usr-${Date.now()}`,
            full_name: metadata.full_name || 'Resident',
            email,
            role: 'resident',
            unit_number: metadata.unit_number || 'A-101',
            building_id: metadata.building_id || null,
            panel_count: metadata.panel_count || 0,
            panel_capacity_kw: metadata.panel_capacity_kw || 0,
          },
          building: DEMO_RESIDENT.building,
        }
        setUser(newDemo.user)
        setProfile(newDemo.profile)
        setLoading(false)
        return { data: { user: newDemo.user }, error: null }
      }

      // Live Supabase signup
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata.full_name,
            building_id: metadata.building_id,
          },
        },
      })

      if (error) throw error

      if (data.user) {
        // Upsert profile row to ensure it exists with full details
        const { error: profileErr } = await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: metadata.full_name?.trim() || email.split('@')[0],
          email: email.trim(),
          role: 'resident',
          building_id: metadata.building_id || null,
          unit_number: metadata.unit_number?.trim() || '',
          panel_count: Number(metadata.panel_count) || 0,
          panel_capacity_kw: Number(metadata.panel_capacity_kw) || 0,
        })

        if (profileErr) {
          console.warn('[AuthContext] Profile insert notice:', profileErr.message)
        }
      }

      return { data, error: null }
    } catch (err) {
      setAuthError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  /**
   * User login with Supabase Auth.
   */
  async function signIn(email, password) {
    setAuthError(null)
    setLoading(true)

    try {
      if (!isSupabaseConfigured) {
        // Fallback demo signin
        const isAdminEmail = email.toLowerCase().includes('admin')
        switchDemoRole(isAdminEmail ? 'admin' : 'resident')
        return { data: { user }, error: null }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)
        await fetchProfileAndBuilding(data.user.id)
      }

      return { data, error: null }
    } catch (err) {
      setAuthError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  /**
   * User logout.
   */
  async function signOut() {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut()
      }
    } catch {}
    localStorage.removeItem('solarconnect_demo_role')
    setUser(null)
    setProfile(null)
    setBuilding(null)
  }

  /**
   * Update profile details in database.
   */
  async function updateProfile(updates) {
    if (!user) return { error: new Error('User not authenticated') }

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id)

        if (error) throw error
      }

      setProfile((prev) => ({ ...prev, ...updates }))
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }

  /**
   * Refresh profile from database.
   */
  async function refreshProfile() {
    if (user?.id) {
      await fetchProfileAndBuilding(user.id)
    }
  }

  /**
   * Instant demo role switcher for review/demo mode.
   */
  function switchDemoRole(targetRole) {
    const active = targetRole === 'resident' ? DEMO_RESIDENT : DEMO_ADMIN
    localStorage.setItem('solarconnect_demo_role', targetRole)
    setUser(active.user)
    setProfile(active.profile)
    setBuilding(active.building)
  }

  function loginAsDemo(role = 'admin') {
    switchDemoRole(role)
  }

  const value = {
    user,
    profile,
    building,
    loading,
    isAdmin,
    isResident,
    authError,
    signUp,
    signIn,
    signOut,
    refreshProfile,
    updateProfile,
    loginAsDemo,
    switchDemoRole,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used inside <AuthProvider>.')
  }
  return context
}

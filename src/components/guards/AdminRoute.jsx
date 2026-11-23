/**
 * AdminRoute.jsx
 *
 * Blocks non-admin users from accessing admin-only pages.
 * Redirects residents to /dashboard if they try to access /admin/*.
 *
 * SECURITY NOTE:
 *   isAdmin comes from AuthContext, which reads it from the 'profiles' table
 *   via Supabase RLS. A resident cannot fake admin access by modifying
 *   client-side state — the database policies enforce it on every query.
 *
 * Usage: Nest inside <ProtectedRoute /> in App.jsx so unauthenticated users
 *        are caught first, then role is checked.
 */
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function AdminRoute() {
  const { isAdmin, loading } = useAuth()

  // Wait for auth + profile to load before deciding
  if (loading) {
    return <LoadingSpinner fullPage />
  }

  if (!isAdmin) {
    // Resident tried to access an admin page — send them to their dashboard
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

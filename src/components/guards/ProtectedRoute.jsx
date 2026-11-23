/**
 * ProtectedRoute.jsx
 *
 * Blocks unauthenticated users from accessing resident/admin pages.
 * Redirects to /login and preserves the originally requested URL
 * so the user is sent back after signing in.
 *
 * Usage: Wrap routes in App.jsx with <ProtectedRoute /> as the parent element.
 */
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Wait for initial auth check to complete before making a redirect decision.
  // Without this, authenticated users would be briefly redirected to /login
  // on every page refresh.
  if (loading) {
    return <LoadingSpinner fullPage />
  }

  if (!user) {
    // Pass the current location so LoginPage can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // User is authenticated — render the requested page
  return <Outlet />
}

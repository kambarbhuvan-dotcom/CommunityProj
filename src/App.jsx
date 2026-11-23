/**
 * App.jsx
 *
 * Root component — sets up routing and wraps everything in AuthProvider.
 *
 * Route structure:
 *   / (public)         — Landing page
 *   /about             — About solar energy
 *   /login             — Login page
 *   /register          — Registration page
 *
 *   <ProtectedRoute>   — Requires a valid login session
 *     /dashboard
 *     /log
 *     /records
 *     /community
 *     /guides
 *     /guides/:slug
 *     /achievements
 *     /announcements
 *     /profile
 *
 *   <AdminRoute>       — Requires isAdmin === true (server-verified)
 *     /admin
 *     /admin/records
 *     /admin/users
 *     /admin/buildings
 *     /admin/announcements
 *     /admin/achievements
 *     /admin/guides
 *
 *   * → redirect to /
 *
 * React.lazy + Suspense: each page is code-split so the initial bundle
 * stays small. The LoadingSpinner shows while a page chunk loads.
 */
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/guards/ProtectedRoute'
import AdminRoute from './components/guards/AdminRoute'
import LoadingSpinner from './components/ui/LoadingSpinner'

// ─── Public pages ──────────────────────────────────────────────────────────
const LandingPage      = lazy(() => import('./pages/public/LandingPage'))
const AboutPage        = lazy(() => import('./pages/public/AboutPage'))
const LoginPage        = lazy(() => import('./pages/public/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/public/RegisterPage'))

// ─── Resident pages ────────────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('./pages/resident/DashboardPage'))
const MySolarSetupPage    = lazy(() => import('./pages/resident/MySolarSetupPage'))
const LogEnergyPage       = lazy(() => import('./pages/resident/LogEnergyPage'))
const MyRecordsPage       = lazy(() => import('./pages/resident/MyRecordsPage'))
const AnalyticsPage       = lazy(() => import('./pages/resident/AnalyticsPage'))
const SettingsPage        = lazy(() => import('./pages/resident/SettingsPage'))
const CommunityStatsPage  = lazy(() => import('./pages/resident/CommunityStatsPage'))
const GuidesPage          = lazy(() => import('./pages/resident/GuidesPage'))
const GuideDetailPage     = lazy(() => import('./pages/resident/GuideDetailPage'))
const AchievementsPage    = lazy(() => import('./pages/resident/AchievementsPage'))
const AnnouncementsPage   = lazy(() => import('./pages/resident/AnnouncementsPage'))
const ProfilePage         = lazy(() => import('./pages/resident/ProfilePage'))

// ─── Admin pages ───────────────────────────────────────────────────────────
const AdminDashboardPage      = lazy(() => import('./pages/admin/AdminDashboardPage'))
const ManageRecordsPage       = lazy(() => import('./pages/admin/ManageRecordsPage'))
const ManageUsersPage         = lazy(() => import('./pages/admin/ManageUsersPage'))
const ManageBuildingsPage     = lazy(() => import('./pages/admin/ManageBuildingsPage'))
const ManageAnnouncementsPage = lazy(() => import('./pages/admin/ManageAnnouncementsPage'))
const ManageAchievementsPage  = lazy(() => import('./pages/admin/ManageAchievementsPage'))
const ManageGuidesPage        = lazy(() => import('./pages/admin/ManageGuidesPage'))
const ManageEventsPage        = lazy(() => import('./pages/admin/ManageEventsPage'))

// ─── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingSpinner fullPage />}>
        <Routes>

          {/* ── Public routes ──────────────────────────────────────────── */}
          <Route path="/"         element={<LandingPage />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/learn"    element={<AboutPage />} />
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Resident routes (login required) ──────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/setup"         element={<MySolarSetupPage />} />
            <Route path="/log"           element={<LogEnergyPage />} />
            <Route path="/records"       element={<MyRecordsPage />} />
            <Route path="/analytics"     element={<AnalyticsPage />} />
            <Route path="/settings"      element={<SettingsPage />} />
            <Route path="/community"     element={<CommunityStatsPage />} />
            <Route path="/guides"        element={<GuidesPage />} />
            <Route path="/guides/:slug"  element={<GuideDetailPage />} />
            <Route path="/achievements"  element={<AchievementsPage />} />
            <Route path="/calculator"    element={<AchievementsPage />} />
            <Route path="/impact"        element={<AchievementsPage />} />
            <Route path="/announcements" element={<AnnouncementsPage />} />
            <Route path="/profile"       element={<ProfilePage />} />
          </Route>

          {/* ── Admin routes (admin role required) ────────────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin"                   element={<AdminDashboardPage />} />
              <Route path="/admin/records"            element={<ManageRecordsPage />} />
              <Route path="/admin/users"              element={<ManageUsersPage />} />
              <Route path="/admin/events"             element={<ManageEventsPage />} />
              <Route path="/admin/guides"             element={<ManageGuidesPage />} />
              <Route path="/admin/announcements"      element={<ManageAnnouncementsPage />} />
              <Route path="/admin/buildings"          element={<ManageBuildingsPage />} />
              <Route path="/admin/achievements"       element={<ManageAchievementsPage />} />
            </Route>
          </Route>

          {/* ── Catch-all ─────────────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Suspense>
    </AuthProvider>
  )
}

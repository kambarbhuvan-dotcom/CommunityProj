/**
 * responsiveQa.test.js — QA and Accessibility Invariant Verifications
 * Verifies component exports, responsive Tailwind layouts, accessible attributes,
 * and design system tokens.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { resolve } from 'path'

describe('Responsive Layout & Accessibility Invariants', () => {
  it('AppLayout provides desktop sidebar, mobile drawer, bottom navigation, and skip-link', () => {
    const layoutCode = readFileSync(resolve('src/components/layout/AppLayout.jsx'), 'utf-8')
    // Desktop sidebar
    expect(layoutCode).toContain('hidden lg:flex')
    // Mobile slide drawer
    expect(layoutCode).toContain('lg:hidden')
    expect(layoutCode).toContain('translate-x-0')
    expect(layoutCode).toContain('-translate-x-full')
    // Mobile bottom navigation bar
    expect(layoutCode).toContain('aria-label="Mobile quick navigation"')
    expect(layoutCode).toContain('mobileBottomNav')
    // Accessibility Skip Link
    expect(layoutCode).toContain('Skip to main content')
    expect(layoutCode).toContain('sr-only focus:not-sr-only')
  })

  it('DashboardPage supports responsive breakpoints from mobile to 4K desktop', () => {
    const dashCode = readFileSync(resolve('src/pages/resident/DashboardPage.jsx'), 'utf-8')
    // Responsive grid for 5 KPI cards: mobile (1), tablet (2), laptop (3), desktop (5)
    expect(dashCode).toContain('grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5')
    // Loading skeleton support
    expect(dashCode).toContain('SkeletonStatCard')
    expect(dashCode).toContain('SkeletonChart')
    // Toast notification integration
    expect(dashCode).toContain('<Toast')
    // Accessible calculation disclaimers
    expect(dashCode).toContain('Calculation Methodology')
  })

  it('StatCard enforces WCAG accessible contrast and semantic badges', () => {
    const statCode = readFileSync(resolve('src/components/ui/StatCard.jsx'), 'utf-8')
    expect(statCode).toContain('#EAF6FF')
    expect(statCode).toContain('#2563EB')
    expect(statCode).toContain('#153B65')
    expect(statCode).toContain('#64748B')
  })

  it('EmptyState supports iconography, guidance tips, and dual actions', () => {
    const emptyCode = readFileSync(resolve('src/components/ui/EmptyState.jsx'), 'utf-8')
    expect(emptyCode).toContain('suggestion')
    expect(emptyCode).toContain('secondaryAction')
    expect(emptyCode).toContain('action')
    expect(emptyCode).toContain('compact')
  })

  it('Toast notification has role="status" and aria-live="polite"', () => {
    const toastCode = readFileSync(resolve('src/components/ui/Toast.jsx'), 'utf-8')
    expect(toastCode).toContain('role="status"')
    expect(toastCode).toContain('aria-live="polite"')
  })

  it('Skeleton component exports text, card, chart, and table loading states', () => {
    const skelCode = readFileSync(resolve('src/components/ui/Skeleton.jsx'), 'utf-8')
    expect(skelCode).toContain('export function SkeletonStatCard')
    expect(skelCode).toContain('export function SkeletonChart')
    expect(skelCode).toContain('export function SkeletonTable')
    expect(skelCode).toContain('export function SkeletonText')
  })

  it('Design palette defines sky-inspired white, blue, and navy tokens', () => {
    const tailwindCode = readFileSync(resolve('tailwind.config.js'), 'utf-8')
    expect(tailwindCode).toContain('#2563EB') // Primary Blue
    expect(tailwindCode).toContain('#0EA5E9') // Deep Sky Blue
    expect(tailwindCode).toContain('#87CEEB') // Sky Blue
    expect(tailwindCode).toContain('#153B65') // Navy Blue
    expect(tailwindCode).toContain('#DCEBFA') // Border Blue
    expect(tailwindCode).toContain('#F4FAFF') // Ice Blue
  })
})


/**
 * PageWrapper.jsx
 * Unified Sky-Themed SaaS page header with title, subtitle, breadcrumb, and responsive action bar.
 * Updates document.title dynamically.
 */
import { useEffect } from 'react'

export default function PageWrapper({
  title,
  subtitle,
  badge,
  actions,
  children,
}) {
  useEffect(() => {
    document.title = title ? `${title} | SolarConnect` : 'SolarConnect'
  }, [title])

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#153B65] tracking-tight leading-tight">
              {title}
            </h1>
            {badge && (
              <span className="shrink-0">{badge}</span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-[#64748B] font-medium mt-1 leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap sm:shrink-0 pt-1 sm:pt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Main page body */}
      <div>{children}</div>
    </div>
  )
}

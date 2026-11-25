/**
 * Skeleton.jsx — Sky-Themed Loading Skeletons
 * Pale Blue & Ice Blue pulse animations for cards, stats, charts, and tables.
 */

export function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div
      className={`animate-pulse bg-[#EAF6FF]/80 ${rounded} ${className}`}
      aria-hidden="true"
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${
            i === lines - 1 && lines > 1 ? 'w-2/3' : i === 0 ? 'w-full' : 'w-5/6'
          }`}
        />
      ))}
    </div>
  )
}

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-[#DCEBFA] p-5 shadow-card flex flex-col justify-between h-[132px]">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
      <div className="space-y-1.5">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function SkeletonChart({ height = 260, title = 'Loading Analytics...' }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCEBFA] p-6 shadow-card">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div
        className="w-full rounded-xl bg-[#F4FAFF] flex items-end justify-between px-6 pb-4 pt-10 gap-3 border border-[#DCEBFA]/50"
        style={{ height }}
      >
        {[40, 65, 85, 55, 95, 70, 80, 50, 90, 60].map((h, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full bg-[#BAE6FD]/70 rounded-t-lg animate-pulse"
              style={{ height: `${h}%` }}
            />
            <Skeleton className="h-2.5 w-6 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DCEBFA] shadow-card overflow-hidden">
      <div className="p-4 border-b border-[#DCEBFA] flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-44 rounded-xl" />
      </div>
      <div className="p-4">
        {/* Table header skeleton */}
        <div className="grid grid-cols-6 gap-4 pb-3 border-b border-[#DCEBFA]/60">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-3/4" />
          ))}
        </div>
        {/* Table rows skeleton */}
        <div className="divide-y divide-[#DCEBFA]/40">
          {Array.from({ length: rows }).map((_, r) => (
            <div key={r} className="grid grid-cols-6 gap-4 py-3.5 items-center">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton
                  key={c}
                  className={`h-4 ${c === 0 ? 'w-24' : c === cols - 1 ? 'w-16' : 'w-20'}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Skeleton

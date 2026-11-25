/**
 * LoadingSpinner.jsx
 *
 * A simple amber spinning indicator.
 * Used by route guards while auth state is loading.
 *
 * Props:
 *   size     – 'sm' | 'md' | 'lg'  (default 'md')
 *   fullPage – boolean — if true, centers in full viewport height
 */
export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
  }

  const spinner = (
    <div
      className={`${sizeClasses[size]} animate-spin rounded-full border-amber-500 border-t-transparent`}
      role="status"
      aria-label="Loading"
    />
  )

  if (fullPage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          {spinner}
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    )
  }

  return spinner
}

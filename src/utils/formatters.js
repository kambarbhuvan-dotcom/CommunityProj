/**
 * formatters.js
 *
 * Date, number, and string formatting helpers.
 * Import only what you need in each component.
 */

// ─── Date formatting ──────────────────────────────────────────────────────

/**
 * Format a date string or Date object to "22 Nov 2024"
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Format a date string to "Nov 2024"
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatMonth(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
}

/**
 * Format a date string to "Nov '24" (compact for chart labels)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatMonthShort(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { month: 'short' })
}

/**
 * Format a date string to "22 Nov" (for chart day labels)
 * @param {string|Date} dateStr
 * @returns {string}
 */
export function formatDayLabel(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
}

/**
 * Returns "Today", "Yesterday", or the formatted date.
 * @param {string} dateStr  YYYY-MM-DD
 * @returns {string}
 */
export function formatRelativeDate(dateStr) {
  if (!dateStr) return '—'
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  if (dateStr === today) return 'Today'
  if (dateStr === yesterday) return 'Yesterday'
  return formatDate(dateStr)
}

// ─── Number formatting ────────────────────────────────────────────────────

/**
 * Format a number with comma thousands separator and fixed decimals.
 * @param {number} n
 * @param {number} decimals
 * @returns {string}
 */
export function formatNumber(n, decimals = 2) {
  if (n === null || n === undefined || isNaN(Number(n))) return '—'
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

// ─── String helpers ───────────────────────────────────────────────────────

/**
 * Truncate text to maxLen characters, appending "…" if truncated.
 * @param {string} text
 * @param {number} maxLen
 * @returns {string}
 */
export function truncateText(text, maxLen = 100) {
  if (!text) return ''
  if (text.length <= maxLen) return text
  return text.slice(0, maxLen).trimEnd() + '…'
}

/**
 * Convert a string to a URL-safe slug.
 * Example: "Solar Panel Tips!" → "solar-panel-tips"
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Capitalize the first letter of a string.
 * @param {string} text
 * @returns {string}
 */
export function capitalize(text) {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/**
 * Returns initials from a full name (up to 2 characters).
 * Example: "Priya Sharma" → "PS", "Rahul" → "R"
 * @param {string} fullName
 * @returns {string}
 */
export function getInitials(fullName) {
  if (!fullName) return '?'
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Button.jsx — Sky-Inspired Reusable Button Component
 * Variants: primary (#2563EB) | secondary (white + blue) | danger | ghost
 * Sizes: sm | md | lg
 */
import { Loader2 } from 'lucide-react'

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 shadow-xs'

  const variants = {
    primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#153B65] focus:ring-[#87CEEB]',
    secondary: 'border border-[#DCEBFA] text-[#2563EB] bg-white hover:bg-[#EAF6FF] hover:border-[#2563EB] focus:ring-[#87CEEB]',
    danger:    'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:ring-red-300',
    ghost:     'text-[#64748B] hover:bg-[#EAF6FF] hover:text-[#2563EB] focus:ring-[#DCEBFA] shadow-none',
    sky:       'bg-[#0EA5E9] text-white hover:bg-[#0284C7] focus:ring-[#87CEEB]',
  }

  const sizes = {
    sm:  'px-3 py-1.5 text-xs',
    md:  'px-4 py-2 text-sm',
    lg:  'px-6 py-3 text-base',
  }

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`}
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {children}
    </button>
  )
}

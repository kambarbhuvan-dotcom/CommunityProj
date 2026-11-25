/**
 * Toast.jsx — Sky-Themed Feedback Toast Notification
 * Displays animated success, error, warning, or informational alerts.
 */
import { useEffect } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const configs = {
  success: {
    icon: CheckCircle2,
    border: 'border-[#DCFCE7]',
    bg: 'bg-white',
    iconColor: 'text-[#22C55E] bg-[#F0FDF4]',
    title: 'Success',
  },
  error: {
    icon: XCircle,
    border: 'border-red-200',
    bg: 'bg-white',
    iconColor: 'text-red-600 bg-red-50',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    border: 'border-amber-200',
    bg: 'bg-white',
    iconColor: 'text-amber-600 bg-amber-50',
    title: 'Notice',
  },
  info: {
    icon: Info,
    border: 'border-[#DCEBFA]',
    bg: 'bg-white',
    iconColor: 'text-[#2563EB] bg-[#EAF6FF]',
    title: 'Information',
  },
}

export default function Toast({
  message,
  type = 'info',
  title,
  duration = 4000,
  onClose,
}) {
  useEffect(() => {
    if (!duration || !onClose) return
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!message) return null

  const cfg = configs[type] || configs.info
  const Icon = cfg.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 right-5 z-50 max-w-sm w-full transition-all duration-300 transform translate-y-0"
    >
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border ${cfg.border} ${cfg.bg} ring-1 ring-black/5`}
      >
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconColor}`}
        >
          <Icon size={18} className="stroke-[2.2]" />
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-bold text-[#153B65] uppercase tracking-wider">
            {title || cfg.title}
          </p>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 leading-relaxed break-words font-medium">
            {message}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#94A3B8] hover:text-[#153B65] hover:bg-[#EAF6FF] transition-colors"
            aria-label="Close notification"
          >
            <X size={15} />
          </button>
        )}
      </div>
    </div>
  )
}

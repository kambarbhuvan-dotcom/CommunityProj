/**
 * Alert.jsx — Sky-Themed Inline Feedback Message
 * Variants: success | warning | error | info
 */
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

const configs = {
  success: { icon: CheckCircle2, bg: 'bg-[#F0FDF4] border-[#DCFCE7]', text: 'text-[#16A34A]', icon_color: 'text-[#22C55E]' },
  warning: { icon: AlertTriangle, bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', icon_color: 'text-amber-500' },
  error:   { icon: XCircle,       bg: 'bg-red-50 border-red-200',      text: 'text-red-800',   icon_color: 'text-red-500' },
  info:    { icon: Info,          bg: 'bg-[#EAF6FF] border-[#DCEBFA]', text: 'text-[#153B65]', icon_color: 'text-[#2563EB]' },
}

export default function Alert({ variant = 'info', title, children, dismissible = false, onDismiss }) {
  const cfg = configs[variant] || configs.info
  const Icon = cfg.icon

  return (
    <div className={`flex gap-3 p-4 rounded-xl border ${cfg.bg}`} role="alert">
      <Icon size={16} className={`${cfg.icon_color} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${cfg.text}`}>{title}</p>}
        {children && <p className={`text-sm ${cfg.text} mt-0.5 font-medium`}>{children}</p>}
      </div>
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={`${cfg.icon_color} hover:opacity-70 shrink-0`}
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

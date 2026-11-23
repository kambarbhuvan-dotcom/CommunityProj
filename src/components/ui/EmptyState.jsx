/**
 * EmptyState.jsx — Sky-Inspired Empty State Component
 * Features Pale Blue (#EAF6FF) icon halo, Deep Sky (#0EA5E9) icon,
 * Navy Blue (#153B65) title, and Slate Grey (#64748B) explanation.
 */
import Button from './Button'

export default function EmptyState({
  icon: Icon,
  title = 'No records found',
  description,
  suggestion,
  action,
  secondaryAction,
  compact = false,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-8 px-4' : 'py-14 px-6'
      } ${className}`}
    >
      {Icon && (
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-2xl bg-[#EAF6FF] border border-[#DCEBFA] flex items-center justify-center text-[#0EA5E9] shadow-sm">
            <Icon size={28} className="text-[#0EA5E9] stroke-[1.75]" />
          </div>
          {/* Subtle soft sunlight dot */}
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#87CEEB] border-2 border-white ring-1 ring-[#0EA5E9]/30" />
        </div>
      )}

      <h3 className="text-base font-bold text-[#153B65] tracking-tight mb-1.5">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-[#64748B] max-w-sm mb-2 leading-relaxed">
          {description}
        </p>
      )}

      {suggestion && (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EAF6FF] border border-[#DCEBFA] text-xs text-[#2563EB] font-semibold mb-5">
          <span className="text-[#0EA5E9] font-bold">Tip:</span> {suggestion}
        </div>
      )}

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 mt-3">
          {secondaryAction && (
            <Button
              variant="secondary"
              size="sm"
              onClick={secondaryAction.onClick}
              className="text-xs"
            >
              {secondaryAction.icon && <secondaryAction.icon size={14} />}
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              variant="primary"
              size="sm"
              onClick={action.onClick}
              className="text-xs"
            >
              {action.icon && <action.icon size={14} />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

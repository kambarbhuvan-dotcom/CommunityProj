/**
 * StatCard.jsx — Sky-Inspired White & Blue KPI Card
 *
 * Visual Specifications:
 * - Pure White container with subtle blue border (#DCEBFA) and soft shadow
 * - Sky Blue (#87CEEB) & Deep Sky Blue (#0EA5E9) icon containers with Pale Blue (#EAF6FF) background
 * - Bold Navy Blue (#153B65) primary metrics
 * - Slate Grey (#64748B) secondary labels & subtitles
 * - Soft Green (#22C55E) for positive energy and efficiency indicators
 */
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'

const colorMap = {
  blue: {
    iconBg: 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]',
    trendUp: 'text-[#22C55E] bg-[#F0FDF4] border-[#DCFCE7]',
    trendDown: 'text-red-500 bg-red-50 border-red-200',
  },
  sky: {
    iconBg: 'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]',
    trendUp: 'text-[#22C55E] bg-[#F0FDF4] border-[#DCFCE7]',
    trendDown: 'text-red-500 bg-red-50 border-red-200',
  },
  green: {
    iconBg: 'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]',
    trendUp: 'text-[#22C55E] bg-[#F0FDF4] border-[#DCFCE7]',
    trendDown: 'text-red-500 bg-red-50 border-red-200',
  },
  solar: {
    iconBg: 'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]',
    trendUp: 'text-[#22C55E] bg-[#F0FDF4] border-[#DCFCE7]',
    trendDown: 'text-red-500 bg-red-50 border-red-200',
  },
  purple: {
    iconBg: 'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]',
    trendUp: 'text-[#22C55E] bg-[#F0FDF4] border-[#DCFCE7]',
    trendDown: 'text-red-500 bg-red-50 border-red-200',
  },
}

export default function StatCard({
  title,
  value,
  unit,
  icon: Icon,
  color = 'sky',
  trend,
  trendValue,
  trendLabel,
  isDemo = false,
  subtitle,
  tooltip,
}) {
  const colors = colorMap[color] || colorMap.sky
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendBadgeStyle =
    trend === 'up'
      ? colors.trendUp
      : trend === 'down'
      ? colors.trendDown
      : 'text-[#64748B] bg-[#F4FAFF] border-[#DCEBFA]'

  return (
    <div className="bg-white rounded-2xl border border-[#DCEBFA] p-5 shadow-card hover:shadow-card-hover hover:border-[#87CEEB] hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between">
      {/* Demo badge */}
      {isDemo && (
        <span className="absolute top-3.5 right-3.5 px-2 py-0.5 rounded-full bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA] text-[10px] font-bold tracking-wider">
          DEMO
        </span>
      )}

      {/* Header row */}
      <div>
        <div className="flex items-center justify-between mb-3 pr-8">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
              {title}
            </p>
            {tooltip && (
              <span title={tooltip} className="cursor-help text-[#94A3B8] hover:text-[#153B65]">
                <Info size={12} />
              </span>
            )}
          </div>
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${colors.iconBg}`}>
              <Icon size={18} className="stroke-[2.2]" />
            </div>
          )}
        </div>

        {/* Value with unit */}
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-2xl sm:text-3xl font-extrabold text-[#153B65] tracking-tight leading-none">
            {value ?? '—'}
          </span>
          {unit && (
            <span className="text-xs sm:text-sm font-semibold text-[#64748B]">
              {unit}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs text-[#64748B] leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trend row */}
      {trendValue && (
        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#DCEBFA]">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${trendBadgeStyle}`}
          >
            <TrendIcon size={12} className="stroke-[2.5]" />
            {trendValue}
          </span>
          {trendLabel && (
            <span className="text-xs text-[#64748B] font-medium truncate">
              {trendLabel}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

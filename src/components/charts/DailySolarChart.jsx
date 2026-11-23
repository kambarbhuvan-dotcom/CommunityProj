/**
 * DailySolarChart.jsx — Sky-Themed Daily Solar Energy Generation Chart
 * Generation bar: Deep Sky Blue (#0EA5E9)
 * Grid lines: Very light blue (#E2EEF9)
 * Cursor: Pale Blue (#EAF6FF)
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatDayLabel } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-3.5 py-2.5 text-xs">
      <p className="font-bold text-[#153B65] mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
        <span className="text-[#64748B]">Generated:</span>
        <span className="font-bold text-[#153B65]">{Number(payload[0].value).toFixed(2)} kWh</span>
      </div>
    </div>
  )
}

export default function DailySolarChart({ data = [], title = 'Daily Solar Generation' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-[#64748B] text-xs">
        No generation data available for this period.
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.log_date) || d.log_date,
    Generation: Number(d.solar_generated_kwh) || 0,
  }))

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">{data.length} days</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} barSize={data.length > 20 ? 8 : 16} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            interval={data.length > 14 ? Math.floor(data.length / 7) : 0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={58}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF', radius: 4 }} />
          <Bar
            dataKey="Generation"
            name="Solar Generation"
            fill="#0EA5E9"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

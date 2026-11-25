/**
 * MonthlySolarChart.jsx — Sky-Themed Monthly Solar Generation Chart
 * Generation bar: Deep Sky Blue (#0EA5E9)
 * Grid lines: Very light blue (#E2EEF9)
 * Cursor: Pale Blue (#EAF6FF)
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-3.5 py-2.5 text-xs">
      <p className="font-bold text-[#153B65] mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.fill }} />
          <span className="text-[#64748B]">{p.name}:</span>
          <span className="font-bold text-[#153B65]">
            {typeof p.value === 'number' ? `${p.value.toFixed(1)} kWh` : p.value}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlySolarChart({ data = [], title = 'Monthly Solar Generation' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-[#64748B] text-xs">
        No monthly generation data available.
      </div>
    )
  }

  const chartData = data.map((d) => ({
    month: d.month,
    Generation: Number(d.generation || d.solar_generated_kwh) || 0,
  }))

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">Monthly Output</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barSize={24} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" kWh" width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF', radius: 4 }} />
          <Bar dataKey="Generation" name="Solar Output" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * EnergyBarChart.jsx
 * Bar chart: Solar Generated vs Consumption (last 7 days)
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { formatDayLabel } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-charcoal-100/40 rounded-xl shadow-card px-4 py-3 text-xs">
      <p className="font-semibold text-charcoal mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.fill }} />
          <span className="text-charcoal-300">{p.name}:</span>
          <span className="font-medium text-charcoal">{p.value.toFixed(2)} kWh</span>
        </div>
      ))}
    </div>
  )
}

export default function EnergyBarChart({ data = [], title = 'Generation vs Consumption' }) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.log_date),
    Generated: parseFloat(d.solar_generated_kwh) || 0,
    Consumed: parseFloat(d.consumption_kwh) || 0,
  }))

  return (
    <div>
      {title && <h3 className="section-heading mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} barSize={12} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EFEA" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A9E91' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8A9E91' }} axisLine={false} tickLine={false} unit=" kWh" width={56} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F0FAF4', radius: 4 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 12, color: '#5A7063' }}>{v}</span>}
          />
          <Bar dataKey="Generated" name="Generated" fill="#176B45" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Consumed"  name="Consumed"  fill="#F5C542" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}


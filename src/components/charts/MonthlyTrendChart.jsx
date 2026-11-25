/**
 * MonthlyTrendChart.jsx — Sky-Themed Monthly Trend Chart
 * Generation: Deep Sky Blue (#0EA5E9)
 * Consumption: Primary Blue (#2563EB)
 * Savings: Soft Green (#22C55E)
 * Grid lines: Very light blue (#E2EEF9)
 */
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-4 py-3 text-xs">
      <p className="font-bold text-[#153B65] mb-1.5">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-[#64748B]">{p.name}:</span>
          <span className="font-bold text-[#153B65]">
            {p.name === 'Savings (₹)' ? `₹${p.value.toLocaleString()}` : `${p.value} kWh`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyTrendChart({ data = [], title = 'Monthly Trend' }) {
  return (
    <div>
      {title && <h3 className="section-heading mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={data} barSize={14} barGap={3}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="kwh" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit=" kWh" width={60} />
          <YAxis yAxisId="rs" orientation="right" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} unit="₹" width={60} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF' }} />
          <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#153B65', fontWeight: 600 }}>{v}</span>} />
          <Bar yAxisId="kwh" dataKey="generation"  name="Generation (kWh)"  fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          <Bar yAxisId="kwh" dataKey="consumption" name="Consumption (kWh)" fill="#2563EB" radius={[4, 4, 0, 0]} />
          <Line yAxisId="rs" dataKey="savings" name="Savings (₹)" stroke="#22C55E" strokeWidth={2.5} dot={{ r: 4, fill: '#22C55E', strokeWidth: 0 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

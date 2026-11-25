/**
 * MonthlyImpactChart.jsx — Sky-Themed Monthly Environmental Impact Projection
 * Utilized bar: Deep Sky Blue (#0EA5E9)
 * Avoided CO₂ line: Primary Blue (#2563EB)
 * Grid lines: Very light blue (#E2EEF9)
 */
import {
  BarChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ComposedChart,
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-4 py-3 text-xs">
      <p className="font-bold text-[#153B65] mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-3 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-[#64748B]">{p.name}:</span>
          </div>
          <span className="font-bold text-[#153B65]">
            {p.name.includes('CO₂') ? `${Number(p.value).toFixed(1)} kg` : `${Number(p.value).toFixed(0)} kWh`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MonthlyImpactChart({
  monthlyUtilizedKwh = 300,
  emissionFactor = 0.82,
  title = 'Monthly Environmental Impact Projection',
}) {
  const monthWeights = [
    { month: 'Jan', weight: 0.95 },
    { month: 'Feb', weight: 1.05 },
    { month: 'Mar', weight: 1.18 },
    { month: 'Apr', weight: 1.22 },
    { month: 'May', weight: 1.20 },
    { month: 'Jun', weight: 0.98 },
    { month: 'Jul', weight: 0.82 },
    { month: 'Aug', weight: 0.80 },
    { month: 'Sep', weight: 0.92 },
    { month: 'Oct', weight: 1.04 },
    { month: 'Nov', weight: 0.96 },
    { month: 'Dec', weight: 0.88 },
  ]

  const data = monthWeights.map((m) => {
    const utilized = monthlyUtilizedKwh * m.weight
    const co2Avoided = utilized * emissionFactor
    return {
      month: m.month,
      'Solar Utilized': parseFloat(utilized.toFixed(1)),
      'Est. CO₂ Avoided': parseFloat(co2Avoided.toFixed(1)),
    }
  })

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">12-Month Projection</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={270}>
        <ComposedChart data={data} barSize={16} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="kwh"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={58}
          />
          <YAxis
            yAxisId="co2"
            orientation="right"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit=" kg"
            width={55}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF', radius: 4 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 12, color: '#153B65', fontWeight: 600 }}>{v}</span>}
          />
          <Bar
            yAxisId="kwh"
            dataKey="Solar Utilized"
            name="Solar Utilized (kWh)"
            fill="#0EA5E9"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="co2"
            type="monotone"
            dataKey="Est. CO₂ Avoided"
            name="Est. CO₂ Avoided (kg)"
            stroke="#2563EB"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2563EB' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/**
 * AnnualImpactChart.jsx — Sky-Themed Annual Environmental Impact Trajectory
 * Annual Utilized bar: Deep Sky Blue (#0EA5E9)
 * Cumulative CO₂ line: Primary Blue (#2563EB)
 * Grid lines: Very light blue (#E2EEF9)
 */
import {
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
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
            {p.name.includes('Tonnes')
              ? `${Number(p.value).toFixed(2)} tonnes`
              : `${Number(p.value).toLocaleString()} kWh`}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function AnnualImpactChart({
  annualUtilizedKwh = 3600,
  emissionFactor = 0.82,
  title = 'Annual Environmental Impact & Lifetime Trajectory',
}) {
  const years = [
    { label: 'Year 1', degradation: 1.0 },
    { label: 'Year 2', degradation: 0.995 },
    { label: 'Year 3', degradation: 0.990 },
    { label: 'Year 4', degradation: 0.985 },
    { label: 'Year 5', degradation: 0.980 },
    { label: 'Year 6', degradation: 0.975 },
    { label: 'Year 7', degradation: 0.970 },
  ]

  let cumulativeCO2Kg = 0
  const data = years.map((y) => {
    const annualUtilized = annualUtilizedKwh * y.degradation
    const annualCO2Kg = annualUtilized * emissionFactor
    cumulativeCO2Kg += annualCO2Kg

    return {
      year: y.label,
      'Annual Utilized': Math.round(annualUtilized),
      'Cumulative CO₂ (Tonnes)': parseFloat((cumulativeCO2Kg / 1000).toFixed(2)),
    }
  })

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">Multi-Year Trajectory</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={270}>
        <ComposedChart data={data} barSize={18} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis
            dataKey="year"
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
            width={60}
          />
          <YAxis
            yAxisId="tonnes"
            orientation="right"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit=" t"
            width={45}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF', radius: 4 }} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 12, color: '#153B65', fontWeight: 600 }}>{v}</span>}
          />
          <Bar
            yAxisId="kwh"
            dataKey="Annual Utilized"
            name="Annual Utilized (kWh)"
            fill="#0EA5E9"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="tonnes"
            type="monotone"
            dataKey="Cumulative CO₂ (Tonnes)"
            name="Cumulative CO₂ (Tonnes)"
            stroke="#2563EB"
            strokeWidth={3}
            dot={{ r: 4, fill: '#2563EB' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

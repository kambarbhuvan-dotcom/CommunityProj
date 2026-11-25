/**
 * GenVsConsumptionChart.jsx — Sky-Themed Solar Generation vs Consumption Chart
 * Solar Generation: Deep Sky Blue (#0EA5E9)
 * Total Consumption: Primary Blue (#2563EB)
 * Positive Energy Indicator: Soft Green (#22C55E)
 * Grid lines: Very light blue (#E2EEF9)
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { formatDayLabel } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const gen = payload.find((p) => p.dataKey === 'Generation')?.value || 0
  const con = payload.find((p) => p.dataKey === 'Consumption')?.value || 0
  const balance = gen - con

  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-4 py-3 text-xs">
      <p className="font-bold text-[#153B65] mb-2">{label}</p>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />
        <span className="text-[#64748B]">Generated:</span>
        <span className="font-bold text-[#153B65]">{Number(gen).toFixed(2)} kWh</span>
      </div>
      <div className="flex items-center gap-2 mb-1.5">
        <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
        <span className="text-[#64748B]">Consumed:</span>
        <span className="font-bold text-[#153B65]">{Number(con).toFixed(2)} kWh</span>
      </div>
      <div className="pt-1.5 border-t border-[#DCEBFA] flex items-center justify-between gap-3">
        <span className="text-[#64748B] font-medium">Energy Balance:</span>
        <span className={`font-bold ${balance >= 0 ? 'text-[#22C55E]' : 'text-red-500'}`}>
          {balance >= 0 ? '+' : ''}{balance.toFixed(2)} kWh
        </span>
      </div>
    </div>
  )
}

export default function GenVsConsumptionChart({
  data = [],
  title = 'Solar Generation vs Electricity Consumption',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-[#64748B] text-xs">
        No records available for this comparison.
      </div>
    )
  }

  const formatted = data.map((d) => ({
    ...d,
    label: formatDayLabel(d.log_date) || d.log_date,
    Generation: Number(d.solar_generated_kwh) || 0,
    Consumption: Number(d.consumption_kwh) || 0,
  }))

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">Daily Comparison</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={formatted} barSize={data.length > 20 ? 6 : 12} barGap={3}>
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
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(v) => <span style={{ fontSize: 12, color: '#153B65', fontWeight: 600 }}>{v}</span>}
          />
          <Bar dataKey="Generation" name="Solar Generation" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Consumption" name="Total Consumption" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

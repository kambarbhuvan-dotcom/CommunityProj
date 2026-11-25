/**
 * CommunitySolarChart.jsx — Sky-Themed Community-Wise Solar Generation Chart
 * Generation bars: Sky & Blue spectrum palette
 * Grid lines: Very light blue (#E2EEF9)
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

const BAR_COLORS = ['#0EA5E9', '#2563EB', '#38BDF8', '#1D4ED8', '#87CEEB', '#60A5FA', '#153B65']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-[#DCEBFA] rounded-xl shadow-card px-3.5 py-2.5 text-xs">
      <p className="font-bold text-[#153B65] mb-1">{d.unit} — {d.resident}</p>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[#64748B]">Building:</span>
        <span className="font-semibold text-[#153B65]">{d.building || 'Community'}</span>
      </div>
      <div className="flex items-center gap-2 mb-0.5">
        <span className="text-[#64748B]">Installed Capacity:</span>
        <span className="font-semibold text-[#153B65]">{d.capacity_kw} kW</span>
      </div>
      <div className="flex items-center gap-2 pt-1 border-t border-[#DCEBFA]">
        <span className="text-[#2563EB] font-bold">Total Generated:</span>
        <span className="font-bold text-[#0EA5E9]">{Number(d.total_gen_kwh).toFixed(1)} kWh</span>
      </div>
    </div>
  )
}

export default function CommunitySolarChart({
  data = [],
  title = 'Community-Wise Solar Generation',
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[260px] text-[#64748B] text-xs">
        No community generation records available.
      </div>
    )
  }

  return (
    <div>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-heading text-base">{title}</h3>
          <span className="text-xs text-[#64748B] font-medium">Generation by Unit</span>
        </div>
      )}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barSize={20} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2EEF9" vertical={false} />
          <XAxis
            dataKey="unit"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit=" kWh"
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#EAF6FF', radius: 4 }} />
          <Bar dataKey="total_gen_kwh" name="Generated (kWh)" radius={[6, 6, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

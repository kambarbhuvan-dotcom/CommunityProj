/**
 * SavingsPieChart.jsx — Sky-Themed Energy Mix Pie Chart
 * Solar: Deep Sky Blue (#0EA5E9)
 * Grid: Border Blue / Slate (#BAE6FD)
 */
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#0EA5E9', '#BAE6FD']
const RADIAN = Math.PI / 180

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  if (percent < 0.08) return null
  return (
    <text x={x} y={y} fill="#153B65" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export default function SavingsPieChart({ solarKwh = 0, gridKwh = 0, title = 'Energy Mix' }) {
  const data = [
    { name: 'Solar', value: parseFloat(solarKwh) || 0 },
    { name: 'Grid',  value: parseFloat(gridKwh)  || 0 },
  ]
  const total = data[0].value + data[1].value

  return (
    <div>
      {title && <h3 className="section-heading mb-4">{title}</h3>}
      {total === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-sm text-[#64748B]">No data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderLabel}>
              {data.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
            </Pie>
            <Tooltip
              formatter={(v, n) => [`${v.toFixed(2)} kWh`, n]}
              contentStyle={{ borderRadius: 12, border: '1px solid #DCEBFA', fontSize: 12, color: '#153B65' }}
            />
            <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 12, color: '#153B65', fontWeight: 600 }}>{v}</span>} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

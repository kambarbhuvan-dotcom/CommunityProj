/**
 * DemoBanner.jsx — Sky-Themed Demo Notice Banner
 */
import { FlaskConical } from 'lucide-react'

export default function DemoBanner({ className = '', message }) {
  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#EAF6FF] border border-[#DCEBFA] ${className}`}
    >
      <FlaskConical size={15} className="text-[#0EA5E9] shrink-0" />
      <p className="text-xs text-[#153B65] font-medium">
        {message || 'This section displays demo data for illustration purposes. Real data will appear after you log your first entry.'}
      </p>
    </div>
  )
}

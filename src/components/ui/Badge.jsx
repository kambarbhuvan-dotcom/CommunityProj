/**
 * Badge.jsx — Sky-Themed Small Colored Pill Label
 * Variants: success | warning | info | danger | solar | eco | admin | demo | default
 */
export default function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    success: 'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
    eco:     'bg-[#F0FDF4] text-[#16A34A] border border-[#DCFCE7]',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    info:    'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]',
    danger:  'bg-red-50 text-red-700 border border-red-200',
    solar:   'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]',
    sky:     'bg-[#EAF6FF] text-[#0EA5E9] border border-[#DCEBFA]',
    admin:   'bg-[#153B65] text-white font-bold',
    demo:    'bg-[#EAF6FF] text-[#2563EB] border border-[#DCEBFA]',
    default: 'bg-[#F4FAFF] text-[#64748B] border border-[#DCEBFA]',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
        variants[variant] || variants.default
      } ${className}`}
    >
      {children}
    </span>
  )
}

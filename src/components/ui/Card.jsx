/**
 * Card.jsx — Sky-Themed White rounded container with Border Blue (#DCEBFA) and soft shadow
 */
export default function Card({
  className = '',
  hover = false,
  padding = 'p-6',
  onClick,
  children,
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl border border-[#DCEBFA] shadow-card ${padding} ${
        hover
          ? 'hover:shadow-card-hover hover:border-[#87CEEB] transition-all duration-200 cursor-pointer'
          : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

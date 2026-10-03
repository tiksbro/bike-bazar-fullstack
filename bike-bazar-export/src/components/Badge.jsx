
const variants = {
  success: { badge: 'text-success bg-successbg', dot: 'bg-success' },
  neutral: { badge: 'text-neutralbadge bg-neutralbadgebg', dot: 'bg-neutralbadge' },
  danger: { badge: 'text-danger bg-dangerbg', dot: 'bg-danger' },
  warning: { badge: 'text-warning bg-warningbg', dot: 'bg-warning' },
  info: {
    badge: 'text-accentsofttext bg-accentsoftbg ring-1 ring-inset ring-accentsoftborder',
    dot: 'bg-accent',
  },
  featured: { badge: 'text-featured bg-featuredbg', dot: 'bg-featured' },
}

function Badge({ variant = 'neutral', dot = false, className = '', children }) {
  const v = variants[variant] ?? variants.neutral
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold px-2.5 py-1 rounded-full ${v.badge} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${v.dot}`} />}
      {children}
    </span>
  )
}

// The price badge shown on vehicle cards and the detail page.
// Both pages used to keep their own copy of these colors; now there is one.
const priceLabels = {
  good: { variant: 'success', label: 'Good Price' },
  fair: { variant: 'neutral', label: 'Fair Price' },
  high: { variant: 'danger', label: 'High Price' },
}

export function PriceBadge({ insight, className = '' }) {
  // If insight is missing or unknown, fall back to "Fair" instead of crashing.
  const p = priceLabels[insight] ?? priceLabels.fair
  return (
    <Badge variant={p.variant} dot className={className}>
      {p.label}
    </Badge>
  )
}

// The small "Bike" / "Car" badge, used on Dashboard, Favorites and My Offers
// so a list that mixes bikes and cars is easy to read.
// Old listings were made before cars existed and have no vehicleType, so they count as bikes.
export function VehicleTypeBadge({ vehicleType, className = '' }) {
  const isCar = vehicleType === 'car'
  return (
    <Badge variant={isCar ? 'info' : 'neutral'} className={className}>
      {isCar ? 'Car' : 'Bike'}
    </Badge>
  )
}

export default Badge
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useCompare } from '../context/CompareContext'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

const priceBadgeStyles = {
  good: { label: 'Good Price', color: '#12805C', bg: '#E3F3EC' },
  fair: { label: 'Fair Price', color: '#8A5A12', bg: '#FBF0DA' },
  high: { label: 'High Price', color: '#A23A2C', bg: '#FBE6E2' },
}

function VehicleCard({ vehicle, variant = 'result' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isComparing, toggleCompare } = useCompare()

  const priceBadge = priceBadgeStyles[vehicle.priceInsight]

  // The whole card is a Link so any click navigates to the detail page;
  // the favorite button and Compare label stop their clicks from bubbling
  // up to it so they can handle their own interaction instead.
  return (
    <Link
      to={`/vehicle/${vehicle.slug}`}
      aria-label={`View ${vehicle.brand} ${vehicle.model}`}
      className="block relative bg-white border border-bordercol rounded-card overflow-hidden flex flex-col transition hover:border-borderstrong hover:shadow-[0_8px_24px_rgba(14,17,22,0.08)] hover:-translate-y-0.5"
    >
      <div
        className="relative h-[168px]"
        style={{ background: artBackgrounds[vehicle.artColor] }}
      >
        <VehicleArt type={vehicle.type} />

        {variant === 'featured' && (
          <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-badge text-featured bg-featuredbg">
            Featured
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(vehicle.id)
          }}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/90 flex items-center justify-center"
          aria-label="Favorite"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill={isFavorite(vehicle.id) ? '#0E1116' : 'none'}
            stroke="#0E1116"
            strokeWidth="1.8"
          >
            <path d="M20.8 4.6c-1.8-1.5-4.5-1.3-6.1.4L12 7.7l-2.7-2.7c-1.6-1.7-4.3-1.9-6.1-.4-2 1.7-2.1 4.8-.3 6.6l8.4 8.6a1 1 0 0 0 1.4 0l8.4-8.6c1.8-1.8 1.7-4.9-.3-6.6z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-[5px]">
        <p className="font-display font-semibold text-[16.5px]">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-[13.5px] text-textmuted">
          {vehicle.year} · {vehicle.mileageKm.toLocaleString()} KM · {vehicle.engineCc}cc
        </p>
        <p className="text-[13px] text-textmuted">{vehicle.location}</p>
        {vehicle.verifiedSeller && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-4 h-4 rounded-full bg-successbg flex items-center justify-center shrink-0">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#12805C" strokeWidth="3">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="text-xs font-semibold text-success">Verified Seller</span>
          </div>
        )}

        <p className="font-display font-bold text-[20px] mt-1"></p>
        <p className="font-display font-bold text-[20px] mt-1">
          Rs. {vehicle.price.toLocaleString('en-IN')}{' '}
          <span className="font-body font-normal text-xs text-textfaint">
            {vehicle.negotiable ? 'Negotiable' : 'Fixed'}
          </span>
        </p>

        <div className="flex items-center justify-between mt-2 pt-[10px] border-t border-bordersoft">
          <label
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1.5 text-xs text-textmuted"
          >
            <input
              type="checkbox"
              checked={isComparing(vehicle.id)}
              onChange={() => toggleCompare(vehicle.id)}
              className="rounded"
            />{' '}
            Compare
          </label>
          <span
            className="text-[11px] font-bold px-2 py-0.5 rounded-badge"
            style={{ color: priceBadge.color, background: priceBadge.bg }}
          >
            {priceBadge.label}
          </span>
        </div>

        <span className="mt-3 w-full text-center bg-sunken hover:bg-accent text-ink hover:text-white text-sm font-semibold rounded-btn py-2 transition">
          View Details
        </span>
      </div>
    </Link>
  )
}

export function VehicleArt({ type }) {
  if (type === 'scooter') {
    return (
      <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full">
        <ellipse cx="100" cy="98" rx="70" ry="9" fill="#00000018" />
        <circle cx="58" cy="86" r="19" fill="#1A1A1A" />
        <circle cx="58" cy="86" r="11" fill="#3A3A3A" />
        <circle cx="145" cy="86" r="19" fill="#1A1A1A" />
        <circle cx="145" cy="86" r="11" fill="#3A3A3A" />
        <path d="M58 86h30l10-22h20l6 14" stroke="#0F766E" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="82" y="55" width="26" height="10" rx="4" fill="#0F766E" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 200 120" className="absolute inset-0 w-full h-full">
      <ellipse cx="100" cy="98" rx="70" ry="9" fill="#00000018" />
      <circle cx="55" cy="86" r="21" fill="#1A1A1A" />
      <circle cx="55" cy="86" r="12" fill="#3A3A3A" />
      <circle cx="148" cy="86" r="21" fill="#1A1A1A" />
      <circle cx="148" cy="86" r="12" fill="#3A3A3A" />
      <path d="M55 86 L72 50 Q90 34 118 40 L148 54 L148 86" stroke="#B5432B" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M86 40 Q100 26 120 32 L128 42 Z" fill="#B5432B" />
      <circle cx="145" cy="52" r="5" fill="#FFE8A3" />
    </svg>
  )
}

export default VehicleCard
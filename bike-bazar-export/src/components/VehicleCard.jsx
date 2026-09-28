import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { useCompare } from '../context/CompareContext'
import Badge, { PriceBadge } from './Badge'
import VehicleArt from './VehicleArt'

// VehicleDetail.jsx imports VehicleArt from this file, so keep it available here.
export { VehicleArt }

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

function VehicleCard({ vehicle, variant = 'result' }) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isComparing, toggleCompare } = useCompare()

  const favorited = isFavorite(vehicle.id)
  const comparing = isComparing(vehicle.id)

  // The whole card is a Link so any click navigates to the detail page;
  // the heart and Compare buttons stop their clicks from bubbling up to
  // it so they can handle their own interaction instead.
  return (
    <Link
      to={`/vehicle/${vehicle.slug}`}
      aria-label={`View ${vehicle.brand} ${vehicle.model}`}
      className="group relative flex flex-col h-full bg-white border border-bordersoft rounded-card overflow-hidden shadow-card transition duration-200 hover:shadow-cardhover hover:-translate-y-1 hover:border-bordercol"
    >
      {/* Image area: taller than before, so the bike is the star of the card */}
      <div
        className="relative h-[200px]"
        style={{ background: artBackgrounds[vehicle.artColor] }}
      >
        <VehicleArt type={vehicle.type} color={vehicle.artColor} />

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {variant === 'featured' && (
            <Badge variant="featured">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
              </svg>
              Featured
            </Badge>
          )}
          {vehicle.verifiedSeller && (
            <Badge variant="success">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Verified
            </Badge>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite(vehicle.id)
          }}
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 shadow-card flex items-center justify-center"
          aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={favorited}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={favorited ? '#E5432E' : 'none'}
            stroke={favorited ? '#E5432E' : '#0E1116'}
            strokeWidth="1.8"
          >
            <path d="M20.8 4.6c-1.8-1.5-4.5-1.3-6.1.4L12 7.7l-2.7-2.7c-1.6-1.7-4.3-1.9-6.1-.4-2 1.7-2.1 4.8-.3 6.6l8.4 8.6a1 1 0 0 0 1.4 0l8.4-8.6c1.8-1.8 1.7-4.9-.3-6.6z" />
          </svg>
        </button>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1 flex flex-col gap-1">
          <p className="font-display font-semibold text-[17px] leading-snug">
            {vehicle.brand} {vehicle.model}
          </p>
          <p className="text-[13.5px] text-textmuted">
            {[
              vehicle.year,
              `${vehicle.mileageKm.toLocaleString()} KM`,
              vehicle.fuelType !== 'Electric' && `${vehicle.engineCc}cc`,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
          <p className="flex items-center gap-1 text-[13px] text-textmuted">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {vehicle.location}
          </p>

          <p className="font-display font-bold text-[22px] mt-2">
            Rs. {vehicle.price.toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-xs text-textfaint">
              {vehicle.negotiable ? 'Negotiable' : 'Fixed'}
            </span>
          </p>

          <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-bordersoft">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                toggleCompare(vehicle.id)
              }}
              aria-pressed={comparing}
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                comparing
                  ? 'bg-accentsoftbg text-accentsofttext ring-accentsoftborder'
                  : 'text-textmuted ring-bordercol hover:ring-borderstrong'
              }`}
            >
              {comparing ? '✓ Comparing' : '+ Compare'}
            </button>
            <PriceBadge insight={vehicle.priceInsight} />
          </div>
        </div>

        <span className="mt-3 w-full text-center bg-sunken group-hover:bg-accent text-ink group-hover:text-white text-sm font-semibold rounded-btn py-2.5 transition">
          View Details
        </span>
      </div>
    </Link>
  )
}

export default VehicleCard
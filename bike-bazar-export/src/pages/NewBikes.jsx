import { Link } from 'react-router-dom'
import { VehicleArt } from '../components/VehicleCard'
import { listNewBikes } from '../services/newBikeService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

function NewBikes() {
  useDocumentTitle('New Bikes')
  const newBikes = listNewBikes()

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">New Bikes</h1>
      <p className="text-textmuted mt-1">
        Official showroom models with reference ex-showroom pricing — not user-submitted listings.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {newBikes.map((bike) => (
          <NewBikeCard key={bike.id} bike={bike} />
        ))}
      </div>
    </div>
  )
}

function NewBikeCard({ bike }) {
  return (
    <Link
      to={`/new-bikes/${bike.slug}`}
      aria-label={`View ${bike.brand} ${bike.model}`}
      className="block relative bg-white border border-bordercol rounded-card overflow-hidden flex flex-col transition hover:border-borderstrong hover:shadow-[0_8px_24px_rgba(14,17,22,0.08)] hover:-translate-y-0.5"
    >
      <div className="relative h-[168px]" style={{ background: artBackgrounds[bike.artColor] }}>
        <VehicleArt type={bike.type} />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-[5px]">
        <p className="font-display font-semibold text-[16.5px]">
          {bike.brand} {bike.model}
        </p>
        <p className="text-[13.5px] text-textmuted">
          {bike.engineCc ? `${bike.engineCc}cc` : 'Electric'} · {bike.fuelType}
        </p>

        <p className="font-display font-bold text-[20px] mt-1">
          Rs. {bike.price.toLocaleString('en-IN')}
        </p>

        <span className="mt-3 w-full text-center bg-sunken hover:bg-accent text-ink hover:text-white text-sm font-semibold rounded-btn py-2 transition">
          View Details
        </span>
      </div>
    </Link>
  )
}

export default NewBikes

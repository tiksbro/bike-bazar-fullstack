import { useParams, Link } from 'react-router-dom'
import { VehicleArt } from '../components/VehicleCard'
import { getNewBikeBySlug } from '../services/newBikeService'
import EmiCalculator from '../components/EmiCalculator'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

function NewBikeDetail() {
  const { slug } = useParams()
  const bike = getNewBikeBySlug(slug)

  useDocumentTitle(bike ? `${bike.brand} ${bike.model}` : 'New Bike Not Found')

  if (!bike) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">New Bike Not Found</h1>
        <p className="text-textmuted mt-2">This model may have been removed or the link is incorrect.</p>
        <Link to="/new-bikes" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Browse New Bikes
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/new-bikes" className="text-sm text-accent font-semibold hover:underline">← Back to New Bikes</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="relative rounded-card overflow-hidden h-[340px]" style={{ background: artBackgrounds[bike.artColor] }}>
          <VehicleArt type={bike.type} />
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px]">{bike.brand} {bike.model}</h1>
          <p className="text-textmuted mt-1">
            {bike.engineCc ? `${bike.engineCc}cc` : 'Electric'} · {bike.fuelType} · {bike.type === 'motorcycle' ? 'Motorcycle' : 'Scooter'}
          </p>

          <p className="font-display font-bold text-[32px] mt-4">
            Rs. {bike.price.toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-sm text-textfaint">Ex-showroom</span>
          </p>

          <p className="text-textmuted mt-4">{bike.description}</p>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <Spec label="Engine" value={bike.engineCc ? `${bike.engineCc}cc` : '—'} />
            <Spec label="Fuel Type" value={bike.fuelType} />
            <Spec label="Type" value={bike.type === 'motorcycle' ? 'Motorcycle' : 'Scooter'} />
          </div>
        </div>
      </div>

      <div className="mt-10">
        <EmiCalculator price={bike.price} />
      </div>
    </div>
  )
}

function Spec({ label, value }) {
  return (
    <div className="border border-bordercol rounded-cardsm p-3">
      <p className="text-xs text-textfaint">{label}</p>
      <p className="font-semibold text-sm mt-0.5">{value}</p>
    </div>
  )
}

export default NewBikeDetail

import { useParams, Link } from 'react-router-dom'
import { VehicleArt } from '../components/VehicleCard'
import { getNewVehicleBySlug } from '../services/newBikeService'
import { getCarCcBand, getCarPowerBand } from '../services/taxService'
import EmiCalculator from '../components/EmiCalculator'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

// The data keeps body types lowercase. These are the versions we show.
const bodyTypeLabels = {
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  muv: 'MUV',
  pickup: 'Pickup',
}

function bodyTypeLabel(type) {
  return bodyTypeLabels[type] ?? type
}

function transmissionLabel(transmission) {
  return transmission === 'automatic' ? 'Automatic' : 'Manual'
}

// What goes in the "Engine" box, and in the grey line under the name.
// Electric vehicles have no cc, so we show their motor power instead.
function engineText(vehicle) {
  if (vehicle.fuelType === 'Electric') {
    return vehicle.motorKw ? `${vehicle.motorKw} kW` : 'Electric'
  }
  return vehicle.engineCc ? `${vehicle.engineCc}cc` : '—'
}

// This one page shows both new bikes and new cars, because they share
// the /new-bikes/:slug route. `vehicleType` on the data tells them apart.
function NewBikeDetail() {
  const { slug } = useParams()
  const vehicle = getNewVehicleBySlug(slug)
  const isCar = vehicle?.vehicleType === 'car'

  useDocumentTitle(vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Vehicle Not Found')

  if (!vehicle) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Vehicle Not Found</h1>
        <p className="text-textmuted mt-2">This model may have been removed or the link is incorrect.</p>
        <Link to="/new-bikes" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Browse New Bikes
        </Link>
      </div>
    )
  }

  // Cars go back to the Cars tab, bikes to the plain page.
  const backTo = isCar ? '/new-bikes?vehicle=car' : '/new-bikes'
  const backText = isCar ? '← Back to New Cars' : '← Back to New Bikes'

  // For cars, work out the tax band now so the tax page opens with the
  // fuel type and band already picked — the visitor only adds a province.
  // URLSearchParams handles the space in a band like '51-125 kW' for us.
  const taxBand = !isCar
    ? null
    : vehicle.fuelType === 'Electric'
      ? getCarPowerBand(vehicle.motorKw)
      : getCarCcBand(vehicle.engineCc)
  const taxQuery = taxBand
    ? new URLSearchParams({ vehicle: 'car', fuel: vehicle.fuelType, band: taxBand }).toString()
    : ''

  const kindLabel = isCar
    ? bodyTypeLabel(vehicle.type)
    : vehicle.type === 'motorcycle' ? 'Motorcycle' : 'Scooter'

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to={backTo} className="text-sm text-accent font-semibold hover:underline">{backText}</Link>

      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div className="relative rounded-card overflow-hidden h-[340px]" style={{ background: artBackgrounds[vehicle.artColor] }}>
          <VehicleArt type={vehicle.type} color={isCar ? vehicle.artColor : undefined} />
        </div>

        <div>
          <h1 className="font-display font-bold text-[28px]">{vehicle.brand} {vehicle.model}</h1>
          <p className="text-textmuted mt-1">
            {engineText(vehicle)} · {vehicle.fuelType} · {kindLabel}
          </p>

          <p className="font-display font-bold text-[32px] mt-4">
            Rs. {vehicle.price.toLocaleString('en-IN')}{' '}
            <span className="font-body font-normal text-sm text-textfaint">Ex-showroom</span>
          </p>

          <p className="text-textmuted mt-4">{vehicle.description}</p>

          {/* Cars have 5 boxes, so 2 per row on a phone and 3 on wider
              screens. Bikes keep their original 3-across row. */}
          {isCar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <Spec label={vehicle.fuelType === 'Electric' ? 'Motor' : 'Engine'} value={engineText(vehicle)} />
              <Spec label="Fuel Type" value={vehicle.fuelType} />
              <Spec label="Body Type" value={bodyTypeLabel(vehicle.type)} />
              <Spec label="Transmission" value={transmissionLabel(vehicle.transmission)} />
              <Spec label="Seats" value={`${vehicle.seats}`} />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <Spec label="Engine" value={engineText(vehicle)} />
              <Spec label="Fuel Type" value={vehicle.fuelType} />
              <Spec label="Type" value={kindLabel} />
            </div>
          )}

          {isCar && (
            <Link
              to={`/tax-calculator?${taxQuery}`}
              className="inline-flex mt-5 text-sm text-accent font-semibold hover:underline"
            >
              Estimate yearly tax →
            </Link>
          )}
        </div>
      </div>

      <div className="mt-10">
        <EmiCalculator price={vehicle.price} />
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

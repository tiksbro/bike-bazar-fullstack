import { Link, useSearchParams } from 'react-router-dom'
import { VehicleArt } from '../components/VehicleCard'
import VehicleTabs from '../components/VehicleTabs'
import { listNewBikes, listNewCars } from '../services/newBikeService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

// 'manual' -> 'Manual', so the data stays lowercase but reads nicely.
function transmissionLabel(transmission) {
  return transmission === 'automatic' ? 'Automatic' : 'Manual'
}

// The small grey line under the name.
// Bikes: 155cc · Petrol
// Cars:  1197cc · Petrol · Manual
// EVs:   Electric · 70 kW · Automatic
//        (no "Electric" twice — the engine part already says it)
function specLine(vehicle) {
  if (vehicle.vehicleType !== 'car') {
    return `${vehicle.engineCc ? `${vehicle.engineCc}cc` : 'Electric'} · ${vehicle.fuelType}`
  }
  const gearbox = transmissionLabel(vehicle.transmission)
  return vehicle.fuelType === 'Electric'
    ? `Electric · ${vehicle.motorKw} kW · ${gearbox}`
    : `${vehicle.engineCc}cc · ${vehicle.fuelType} · ${gearbox}`
}

// The tab lives in the URL (/new-bikes = Bikes, /new-bikes?vehicle=car
// = Cars), the same pattern as the Browse and Tax Calculator pages, so a
// refresh, the Back button and a shared link all keep the right tab.
function NewBikes() {
  const [searchParams, setSearchParams] = useSearchParams()
  const vehicle = searchParams.get('vehicle') === 'car' ? 'car' : 'bike'
  const isCar = vehicle === 'car'

  useDocumentTitle(isCar ? 'New Cars' : 'New Bikes')

  const vehicles = isCar ? listNewCars() : listNewBikes()

  // Bikes is the default, so its URL is just /new-bikes.
  function switchTab(nextVehicle) {
    setSearchParams(nextVehicle === 'car' ? { vehicle: 'car' } : {})
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">{isCar ? 'New Cars' : 'New Bikes'}</h1>
      <p className="text-textmuted mt-1">
        Official showroom models with reference ex-showroom pricing — not user-submitted listings.
      </p>

      <VehicleTabs value={vehicle} onChange={switchTab} className="mt-4" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {vehicles.map((v) => (
          <NewVehicleCard key={v.id} vehicle={v} />
        ))}
      </div>
    </div>
  )
}

// One card for both kinds. Only the grey spec line and the art colour
// change; everything else is the same card bikes have always had.
function NewVehicleCard({ vehicle }) {
  const isCar = vehicle.vehicleType === 'car'

  return (
    <Link
      to={`/new-bikes/${vehicle.slug}`}
      aria-label={`View ${vehicle.brand} ${vehicle.model}`}
      className="block relative bg-white border border-bordercol rounded-card overflow-hidden flex flex-col transition hover:border-borderstrong hover:shadow-[0_8px_24px_rgba(14,17,22,0.08)] hover:-translate-y-0.5"
    >
      <div className="relative h-[168px]" style={{ background: artBackgrounds[vehicle.artColor] }}>
        {/* Cars get their artColor so the body matches the background.
            Bikes pass nothing, so they keep VehicleArt's own default. */}
        <VehicleArt type={vehicle.type} color={isCar ? vehicle.artColor : undefined} />
      </div>

      <div className="p-4 flex-1 flex flex-col gap-[5px]">
        <p className="font-display font-semibold text-[16.5px]">
          {vehicle.brand} {vehicle.model}
        </p>
        <p className="text-[13.5px] text-textmuted">{specLine(vehicle)}</p>

        <p className="font-display font-bold text-[20px] mt-1">
          Rs. {vehicle.price.toLocaleString('en-IN')}
        </p>

        <span className="mt-3 w-full text-center bg-sunken hover:bg-accent text-ink hover:text-white text-sm font-semibold rounded-btn py-2 transition">
          View Details
        </span>
      </div>
    </Link>
  )
}

export default NewBikes

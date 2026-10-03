import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import { getByIds, getHealthScore } from '../services/vehicleService'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'

// Nice names for each body type, e.g. 'suv' -> 'SUV'.
const TYPE_LABELS = {
  motorcycle: 'Motorcycle',
  scooter: 'Scooter',
  hatchback: 'Hatchback',
  sedan: 'Sedan',
  suv: 'SUV',
  muv: 'MUV',
  pickup: 'Pickup',
}

// Rows used by both tables. Each row has a label and a `get` function
// that turns one vehicle into the text for its cell.
const priceRow = { label: 'Price', get: (v) => `Rs. ${v.price.toLocaleString('en-IN')}` }
const typeRow = { label: 'Type', get: (v) => TYPE_LABELS[v.type] || v.type }
const yearRow = { label: 'Year', get: (v) => v.year }
const kmRow = { label: 'KM Driven', get: (v) => v.mileageKm.toLocaleString() }
// Electric vehicles have no engine cc, so say "Electric motor" instead of a blank.
const engineRow = {
  label: 'Engine',
  get: (v) => (v.fuelType === 'Electric' ? 'Electric motor' : v.engineCc ? `${v.engineCc}cc` : '—'),
}
const fuelRow = { label: 'Fuel Type', get: (v) => v.fuelType }
// Uses the bike formula for bikes and the car formula for cars (vehicleService.js).
const healthRow = { label: 'Health Score', get: (v) => `${getHealthScore(v).overall} / 100` }
const locationRow = { label: 'Location', get: (v) => v.location }

const BIKE_ROWS = [priceRow, typeRow, yearRow, kmRow, engineRow, fuelRow, healthRow, locationRow]

// `optional: true` rows only show up if at least one car in the table has
// that detail. E.g. "Battery" is hidden when you compare two petrol cars.
const CAR_ROWS = [
  priceRow,
  { ...typeRow, label: 'Body Type' },
  yearRow,
  kmRow,
  engineRow,
  fuelRow,
  { label: 'Transmission', get: (v) => (v.transmission === 'automatic' ? 'Automatic' : 'Manual') },
  { label: 'Seats', get: (v) => v.seats ?? '—' },
  { label: 'Drive Type', optional: true, has: (v) => Boolean(v.driveType), get: (v) => v.driveType || '—' },
  { label: 'Battery', optional: true, has: (v) => v.batteryKwh > 0, get: (v) => (v.batteryKwh > 0 ? `${v.batteryKwh} kWh` : '—') },
  { label: 'Range', optional: true, has: (v) => v.rangeKm > 0, get: (v) => (v.rangeKm > 0 ? `${v.rangeKm.toLocaleString()} km` : '—') },
  healthRow,
  locationRow,
]

// Two arrows pointing opposite ways: the "compare" icon for the empty boxes.
function CompareIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 4L3 8l4 4" />
      <path d="M3 8h13" />
      <path d="M17 20l4-4-4-4" />
      <path d="M21 16H8" />
    </svg>
  )
}

function Compare() {
  const { user } = useAuth()
  const { compareIds, clearCompare } = useCompare()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Same "ignore" trick as on the Favorites page: if compareIds changes
    // while an older request is still running, the old answer is thrown away.
    let ignore = false
    async function loadVehicles() {
      setLoading(true)
      setError('')
      try {
        const data = await getByIds(compareIds)
        if (!ignore) setVehicles(data)
      } catch {
        if (!ignore) setError("Couldn't load comparison. Check your connection and try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadVehicles()
    return () => {
      ignore = true
    }
  }, [compareIds, retryCount])

  // Only bikes that are still in the compare list (so "Clear all" empties
  // the table at once), and grey placeholders only on the first load.
  const shownVehicles = vehicles.filter((v) => compareIds.includes(v.id))
  const showSkeleton = loading && vehicles.length === 0

  // Bikes and cars are never compared in one table. New lists can only hold
  // one kind (the server makes sure), but a list saved before Phase 6 might
  // have both, so each kind gets its own table.
  // (Old listings have no vehicleType, so anything that is not 'car' is a bike.)
  const shownCars = shownVehicles.filter((v) => v.vehicleType === 'car')
  const shownBikes = shownVehicles.filter((v) => v.vehicleType !== 'car')
  const hasBothKinds = shownCars.length > 0 && shownBikes.length > 0

  let pageTitle = 'Compare Vehicles'
  if (!hasBothKinds && shownCars.length > 0) pageTitle = 'Compare Cars'
  if (!hasBothKinds && shownBikes.length > 0) pageTitle = 'Compare Bikes'

  let content
  if (!user) {
    content = (
      <EmptyState
        icon={<CompareIcon />}
        title="Log in to compare vehicles"
        message="Tap + Compare on up to 4 bikes (or 4 cars), then see them side by side here."
        actionLabel="Log in"
        actionTo="/login"
      />
    )
  } else if (showSkeleton) {
    content = <CompareTableSkeleton />
  } else if (error) {
    content = (
      <EmptyState
        title="Couldn't load the comparison"
        message="Check your connection and try again."
        actionLabel="Try Again"
        onAction={() => setRetryCount((c) => c + 1)}
      />
    )
  } else if (shownVehicles.length === 0) {
    content = (
      <EmptyState
        icon={<CompareIcon />}
        title="Nothing to compare yet"
        message="Tap + Compare on up to 4 bikes (or 4 cars), then see them side by side here."
        actionLabel="Browse Vehicles"
        actionTo="/vehicles"
      />
    )
  } else {
    content = hasBothKinds ? (
      <div className="flex flex-col gap-10">
        <p className="text-sm text-textmuted bg-sunken rounded-ctl px-3 py-2">
          Your list has both bikes and cars, so they are shown in separate tables.
          Bikes can only be compared with bikes, and cars with cars.
        </p>
        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Cars</h2>
          <CompareTable vehicles={shownCars} rows={CAR_ROWS} />
        </section>
        <section>
          <h2 className="font-display font-semibold text-lg mb-2">Bikes</h2>
          <CompareTable vehicles={shownBikes} rows={BIKE_ROWS} />
        </section>
      </div>
    ) : shownCars.length > 0 ? (
      <CompareTable vehicles={shownCars} rows={CAR_ROWS} />
    ) : (
      <CompareTable vehicles={shownBikes} rows={BIKE_ROWS} />
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-[26px]">{pageTitle}</h1>
        {shownVehicles.length > 0 && (
          <button onClick={clearCompare} className="text-sm text-accent font-semibold hover:underline">
            Clear all
          </button>
        )}
      </div>
      <div className="mt-6">{content}</div>
    </div>
  )
}

// One side-by-side table: a label column, then one column per vehicle.
function CompareTable({ vehicles, rows }) {
  // Drop optional rows that no vehicle in this table has (see CAR_ROWS).
  const shownRows = rows.filter((row) => !row.optional || vehicles.some(row.has))

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left text-xs text-textfaint p-3 w-32"></th>
            {vehicles.map((v) => (
              <th key={v.id} className="text-left p-3 border-b border-bordercol font-display font-semibold">
                {v.brand} {v.model}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shownRows.map((row) => (
            <tr key={row.label}>
              <td className="text-xs font-semibold text-textfaint p-3 border-b border-bordersoft">{row.label}</td>
              {vehicles.map((v) => (
                <td key={v.id} className="p-3 border-b border-bordersoft text-sm">{row.get(v)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Grey copy of the comparison table: a label column and 2 bike columns,
// one grey bar per row (Price, Year, KM Driven...).
function CompareTableSkeleton() {
  return (
    <div className="overflow-x-auto" role="status" aria-label="Loading comparison">
      <div className="min-w-[480px]">
        <div className="grid grid-cols-[8rem_1fr_1fr] border-b border-bordercol">
          <div />
          <div className="p-3"><Skeleton className="h-5 w-3/5" /></div>
          <div className="p-3"><Skeleton className="h-5 w-3/5" /></div>
        </div>
        {BIKE_ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-[8rem_1fr_1fr] border-b border-bordersoft">
            <div className="p-3"><Skeleton className="h-3.5 w-16" /></div>
            <div className="p-3"><Skeleton className="h-4 w-2/5" /></div>
            <div className="p-3"><Skeleton className="h-4 w-2/5" /></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Compare

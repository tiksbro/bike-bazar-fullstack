import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCompare } from '../context/CompareContext'
import { getByIds } from '../services/vehicleService'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'

const rows = [
  { label: 'Price', get: (v) => `Rs. ${v.price.toLocaleString('en-IN')}` },
  { label: 'Year', get: (v) => v.year },
  { label: 'KM Driven', get: (v) => v.mileageKm.toLocaleString() },
  { label: 'Engine', get: (v) => (v.engineCc ? `${v.engineCc}cc` : '—') },
  { label: 'Fuel Type', get: (v) => v.fuelType },
  { label: 'Location', get: (v) => v.location },
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

  let content
  if (!user) {
    content = (
      <EmptyState
        icon={<CompareIcon />}
        title="Log in to compare bikes"
        message="Tap + Compare on up to 4 bikes, then see them side by side here."
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
        message="Tap + Compare on up to 4 bikes, then see them side by side here."
        actionLabel="Browse Vehicles"
        actionTo="/vehicles"
      />
    )
  } else {
    content = (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs text-textfaint p-3 w-32"></th>
              {shownVehicles.map((v) => (
                <th key={v.id} className="text-left p-3 border-b border-bordercol font-display font-semibold">
                  {v.brand} {v.model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="text-xs font-semibold text-textfaint p-3 border-b border-bordersoft">{row.label}</td>
                {shownVehicles.map((v) => (
                  <td key={v.id} className="p-3 border-b border-bordersoft text-sm">{row.get(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-[26px]">Compare Vehicles</h1>
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
        {rows.map((row) => (
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

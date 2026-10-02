import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDealerById } from '../services/dealerService'
import VehicleCard from '../components/VehicleCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { Skeleton, VehicleGridSkeleton } from '../components/Skeleton'

function DealerDetail() {
  const { id } = useParams()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function loadDealer() {
      setLoading(true)
      setError('')
      try {
        const data = await getDealerById(id)
        setDealer(data)
      } catch {
        setError("Couldn't load this dealer. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadDealer()
  }, [id, retryCount])

  useDocumentTitle(loading ? 'Loading...' : error ? 'Error' : dealer ? dealer.businessName : 'Dealer Not Found')

  if (loading) {
    return <DealerDetailSkeleton />
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
        <div className="mt-6">
          <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
        </div>
      </div>
    )
  }

  if (!dealer) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Dealer Not Found</h1>
        <Button to="/dealers" className="mt-6">
          Browse Dealers
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dealers" className="text-sm text-accent font-semibold hover:underline">← Back to dealers</Link>

      <div className="flex items-start justify-between mt-4 gap-2">
        <div>
          <h1 className="font-display font-bold text-[26px]">{dealer.businessName}</h1>
          <p className="text-textmuted mt-1">{dealer.city}</p>
        </div>
        {dealer.verified && (
          <Badge variant="success" className="shrink-0">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            Verified Dealer
          </Badge>
        )}
      </div>

      {dealer.brands && dealer.brands.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {dealer.brands.map((brand) => (
            <span key={brand} className="text-xs bg-sunken px-2 py-1 rounded-badge">
              {brand}
            </span>
          ))}
        </div>
      )}

      <h2 className="font-display font-bold text-xl mt-10">Available Vehicles</h2>
      {dealer.vehicles.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No active listings right now" message="Check back soon — this dealer's inventory updates regularly." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {dealer.vehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} variant="result" />
          ))}
        </div>
      )}
    </div>
  )
}

// Grey copy of this page: back link, dealer name + city, badge, brand
// chips, then the "Available Vehicles" heading with 3 grey bike cards.
function DealerDetailSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8" role="status" aria-label="Loading dealer">
      <Skeleton className="h-4 w-32" />

      <div className="flex items-start justify-between mt-4 gap-2">
        <div className="flex-1">
          <Skeleton className="h-8 w-2/3 sm:w-1/3" />
          <Skeleton className="h-4 w-24 mt-2" />
        </div>
        <Skeleton className="h-6 w-28 rounded-full shrink-0" />
      </div>

      <div className="flex gap-1.5 mt-4">
        <Skeleton className="h-6 w-14 rounded-badge" />
        <Skeleton className="h-6 w-16 rounded-badge" />
        <Skeleton className="h-6 w-12 rounded-badge" />
      </div>

      <Skeleton className="h-6 w-48 mt-10" />
      {/* The grid has its own "Loading vehicles" label; the outer box
          already says "Loading dealer", so hide this one from screen readers. */}
      <div aria-hidden="true">
        <VehicleGridSkeleton count={3} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4" />
      </div>
    </div>
  )
}

export default DealerDetail
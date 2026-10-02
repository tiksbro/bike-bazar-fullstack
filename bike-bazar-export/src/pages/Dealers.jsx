import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listDealers } from '../services/dealerService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import EmptyState from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'

function Dealers() {
  useDocumentTitle('Verified Dealers')
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function loadDealers() {
      setLoading(true)
      setError('')
      try {
        const data = await listDealers()
        setDealers(data)
      } catch {
        setError("Couldn't load dealers. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadDealers()
  }, [retryCount])

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Verified Dealers</h1>
      <p className="text-textmuted text-sm mt-1">Browse trusted multi-brand showrooms across Nepal.</p>

      {loading ? (
        // 6 grey dealer cards in the same grid as the real ones.
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6" role="status" aria-label="Loading dealers">
          {Array.from({ length: 6 }, (_, index) => (
            <DealerCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <Card padding="lg" className="mt-6 text-center">
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
          <div className="mt-4">
            <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
          </div>
        </Card>
      ) : dealers.length === 0 ? (
        <div className="mt-6">
          <EmptyState title="No dealers registered yet" message="Verified showrooms will appear here once they join." />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {dealers.map((dealer) => (
            <Link
              key={dealer.id}
              to={`/dealer/${dealer.id}`}
              className="group bg-white border border-bordersoft rounded-card p-5 shadow-card transition duration-200 hover:shadow-cardhover hover:-translate-y-1 hover:border-bordercol"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-bold text-lg">{dealer.businessName}</p>
                {dealer.verified && (
                  <Badge variant="success" className="shrink-0">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-textmuted mt-1">{dealer.city}</p>

              {dealer.brands && dealer.brands.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {dealer.brands.map((brand) => (
                    <span key={brand} className="text-xs bg-sunken px-2 py-1 rounded-badge">
                      {brand}
                    </span>
                  ))}
                </div>
              )}

              <span className="mt-4 block w-full text-center bg-sunken group-hover:bg-accent text-ink group-hover:text-white text-sm font-semibold rounded-btn py-2 transition">
                View Dealer
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// Grey copy of one dealer card: name + badge, city, a few brand chips,
// and the "View Dealer" button.
function DealerCardSkeleton() {
  return (
    <div className="bg-white border border-bordersoft rounded-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-1/4 mt-2" />
      <div className="flex gap-1.5 mt-3">
        <Skeleton className="h-6 w-14 rounded-badge" />
        <Skeleton className="h-6 w-16 rounded-badge" />
        <Skeleton className="h-6 w-12 rounded-badge" />
      </div>
      <Skeleton className="h-9 w-full mt-4 rounded-btn" />
    </div>
  )
}

export default Dealers
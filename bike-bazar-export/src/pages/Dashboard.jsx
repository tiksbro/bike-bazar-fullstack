import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Each listing status gets a Badge look (colors come from the design tokens).
const listingStatus = {
  active: { label: 'Active', variant: 'success' },
  paused: { label: 'Paused', variant: 'warning' },
  sold: { label: 'Sold', variant: 'neutral' },
}

function Dashboard() {
  useDocumentTitle('Seller Dashboard')
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [offers, setOffers] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState('')

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  useEffect(() => {
    async function loadListings() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_URL}/vehicles/mine/list`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (res.ok) {
          const data = await res.json()
          setListings(data)
        }
      } catch {
        setError("Couldn't load your listings. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadListings()
  }, [user, retryCount])

  useEffect(() => {
    async function loadOffers() {
      if (!user) {
        setOffersLoading(false)
        return
      }
      setOffersLoading(true)
      setOffersError('')
      try {
        const res = await fetch(`${API_URL}/offers/received`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) throw new Error('Failed to load offers')
        const data = await res.json()
        setOffers(data)
      } catch {
        setOffersError("Couldn't load offers.")
      } finally {
        setOffersLoading(false)
      }
    }
    loadOffers()
  }, [user])

  async function updateStatus(vehicleId, newStatus) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setListings(listings.map((l) => (l.id === vehicleId ? updated : l)))
    }
  }

  async function boostListing(vehicleId, days) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}/boost`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ days }),
    })
    if (res.ok) {
      const updated = await res.json()
      setListings(listings.map((l) => (l.id === vehicleId ? updated : l)))
    }
  }

  async function deleteListing(vehicleId) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.ok) {
      setListings(listings.filter((l) => l.id !== vehicleId))
    }
  }

  async function respondToOffer(offerId, action, counterAmount) {
    const res = await fetch(`${API_URL}/offers/${offerId}/respond`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ action, counterAmount }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOffers(offers.map((o) => (o.id === offerId ? updated : o)))
    }
  }

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Log In to View Your Dashboard</h1>
        <Button to="/login" className="mt-6">
          Log In
        </Button>
      </div>
    )
  }

  const totalCount = listings.length
  const activeCount = listings.filter((l) => l.status === 'active' || !l.status).length
  const pausedCount = listings.filter((l) => l.status === 'paused').length
  const soldCount = listings.filter((l) => l.status === 'sold').length

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Seller Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Listings" value={totalCount} />
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Paused" value={pausedCount} />
        <StatCard label="Sold" value={soldCount} />
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Offers Received</h2>
        {offersLoading ? (
          <p className="text-textmuted text-sm mt-4">Loading offers...</p>
        ) : offersError ? (
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-4 inline-block">{offersError}</p>
        ) : offers.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No offers yet"
              message="When someone makes an offer on one of your bikes, it will show up here."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {offers.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onRespond={respondToOffer} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl">Your Listings</h2>
          <Button to="/sell" size="sm">
            + Add Vehicle
          </Button>
        </div>
        {loading ? (
          <p className="text-textmuted text-sm mt-4">Loading your listings...</p>
        ) : error ? (
          <Card padding="lg" className="mt-6 text-center">
            <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
            <div className="mt-4">
              <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
            </div>
          </Card>
        ) : listings.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="You haven't listed any bikes yet"
              message="Listing takes about 2 minutes, and you can edit it anytime."
              actionLabel="Sell Your Vehicle"
              actionTo="/sell"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {listings.map((vehicle) => {
              const status = vehicle.status || 'active'
              const s = listingStatus[status]
              return (
                <Card
                  key={vehicle.id}
                  padding="sm"
                  className="flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="font-display font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-textmuted">Rs. {vehicle.price.toLocaleString('en-IN')}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant={s.variant} dot>
                        {s.label}
                      </Badge>
                      {vehicle.featured && (
                        <Badge variant="featured">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
                          </svg>
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button to={`/vehicle/${vehicle.slug}`} variant="secondary" size="sm">
                      View
                    </Button>
                    {status !== 'sold' && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => updateStatus(vehicle.id, status === 'active' ? 'paused' : 'active')}
                      >
                        {status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                    )}
                    {status !== 'sold' && (
                      <Button variant="dark" size="sm" onClick={() => updateStatus(vehicle.id, 'sold')}>
                        Mark Sold
                      </Button>
                    )}
                    {status !== 'sold' && !vehicle.featured && (
                      <Button size="sm" onClick={() => boostListing(vehicle.id, 7)}>
                        Boost (7 days)
                      </Button>
                    )}
                    <Button variant="danger" size="sm" onClick={() => deleteListing(vehicle.id)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// How each offer status looks.
const offerStatus = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'neutral' },
  countered: { label: 'Countered', variant: 'info' },
}

function OfferCard({ offer, onRespond }) {
  const [showCounter, setShowCounter] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

  const s = offerStatus[offer.status]

  function handleCounterSubmit() {
    if (!counterAmount) return
    onRespond(offer.id, 'counter', Number(counterAmount))
    setShowCounter(false)
  }

  return (
    // A pending offer is waiting for a reply, so its card gets a soft amber tint.
    <Card padding="sm" tone={offer.status === 'pending' ? 'attention' : 'default'}>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-semibold">
            {offer.vehicle.brand} {offer.vehicle.model}
          </p>
          <p className="text-sm text-textmuted mt-0.5">
            From {offer.buyer.name} · Rs. {offer.amount.toLocaleString('en-IN')}
          </p>
          {offer.message && <p className="text-sm text-textmuted mt-1 italic">"{offer.message}"</p>}
          {offer.status === 'countered' && (
            <p className="text-sm text-accent mt-1">Your counter: Rs. {offer.counterAmount.toLocaleString('en-IN')}</p>
          )}
        </div>
        <Badge variant={s.variant} dot>
          {s.label}
        </Badge>
      </div>

      {offer.status === 'pending' && !showCounter && (
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={() => onRespond(offer.id, 'accept')}>
            Accept
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCounter(true)}>
            Counter
          </Button>
          <Button variant="danger" size="sm" onClick={() => onRespond(offer.id, 'reject')}>
            Reject
          </Button>
        </div>
      )}

      {offer.status === 'pending' && showCounter && (
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="Your counter amount"
            className="flex-1 min-w-0 border border-bordercol rounded-ctl px-3 py-1.5 text-sm bg-white"
          />
          <Button size="sm" onClick={handleCounterSubmit}>
            Send
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowCounter(false)}>
            Cancel
          </Button>
        </div>
      )}
    </Card>
  )
}

export default Dashboard
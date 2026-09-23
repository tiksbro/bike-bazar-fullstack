import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const statusStyles = {
  active: { label: 'Active', color: 'text-success', bg: 'bg-successbg' },
  paused: { label: 'Paused', color: 'text-warning', bg: 'bg-warningbg' },
  sold: { label: 'Sold', color: 'text-neutralbadge', bg: 'bg-neutralbadgebg' },
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
        <Link to="/login" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Log In
        </Link>
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
          <p className="text-textmuted text-sm mt-4">No offers yet.</p>
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
          <Link
            to="/sell"
            className="text-sm font-semibold px-4 py-2 rounded-btn bg-accent hover:bg-accenthover transition text-white"
          >
            + Add Vehicle
          </Link>
        </div>
        {loading ? (
          <p className="text-textmuted text-sm mt-4">Loading your listings...</p>
        ) : error ? (
          <div className="mt-6 text-center border border-bordercol rounded-card p-10">
            <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
            <div>
              <button
                onClick={() => setRetryCount((c) => c + 1)}
                className="inline-flex mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="mt-6 text-center border border-bordercol rounded-card p-10">
            <p className="text-textmuted">You haven't listed any vehicles yet.</p>
            <Link to="/sell" className="inline-flex mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
              Sell Your Vehicle
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {listings.map((vehicle) => {
              const status = vehicle.status || 'active'
              const s = statusStyles[status]
              return (
                <div
                  key={vehicle.id}
                  className="border border-bordercol rounded-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="font-display font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-textmuted">Rs. {vehicle.price.toLocaleString('en-IN')}</p>
                    <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-badge ${s.color} ${s.bg}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/vehicle/${vehicle.slug}`}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                    >
                      View
                    </Link>
                    {status !== 'sold' && (
                      <button
                        onClick={() => updateStatus(vehicle.id, status === 'active' ? 'paused' : 'active')}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                      >
                        {status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    )}
                    {status !== 'sold' && (
                      <button
                        onClick={() => updateStatus(vehicle.id, 'sold')}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-ink text-white"
                      >
                        Mark Sold
                      </button>
                    )}
                    {status !== 'sold' && !vehicle.featured && (
                      <button
                        onClick={() => boostListing(vehicle.id, 7)}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-accent text-white"
                      >
                        Boost (7 days)
                      </button>
                    )}
                    {vehicle.featured && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-badge text-featured bg-featuredbg">
                        ⭐ Featured
                      </span>
                    )}
                    <button
                      onClick={() => deleteListing(vehicle.id)}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-danger text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border border-bordercol rounded-card p-4">
      <p className="text-xs text-textfaint">{label}</p>
      <p className="font-display font-bold text-2xl mt-1">{value}</p>
    </div>
  )
}

function OfferCard({ offer, onRespond }) {
  const [showCounter, setShowCounter] = useState(false)
  const [counterAmount, setCounterAmount] = useState('')

  const statusBadge = {
    pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warningbg' },
    accepted: { label: 'Accepted', color: 'text-success', bg: 'bg-successbg' },
    rejected: { label: 'Rejected', color: 'text-neutralbadge', bg: 'bg-neutralbadgebg' },
    countered: { label: 'Countered', color: 'text-accent', bg: 'bg-accentsoftbg' },
  }[offer.status]

  function handleCounterSubmit() {
    if (!counterAmount) return
    onRespond(offer.id, 'counter', Number(counterAmount))
    setShowCounter(false)
  }

  return (
    <div className="border border-bordercol rounded-card p-4">
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
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-badge shrink-0 ${statusBadge.color} ${statusBadge.bg}`}>
          {statusBadge.label}
        </span>
      </div>

      {offer.status === 'pending' && !showCounter && (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onRespond(offer.id, 'accept')}
            className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-success text-white"
          >
            Accept
          </button>
          <button
            onClick={() => setShowCounter(true)}
            className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
          >
            Counter
          </button>
          <button
            onClick={() => onRespond(offer.id, 'reject')}
            className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-danger text-danger"
          >
            Reject
          </button>
        </div>
      )}

      {offer.status === 'pending' && showCounter && (
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            value={counterAmount}
            onChange={(e) => setCounterAmount(e.target.value)}
            placeholder="Your counter amount"
            className="flex-1 border border-bordercol rounded-ctl px-3 py-1.5 text-sm"
          />
          <button
            onClick={handleCounterSubmit}
            className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-accent text-white"
          >
            Send
          </button>
          <button
            onClick={() => setShowCounter(false)}
            className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}

export default Dashboard
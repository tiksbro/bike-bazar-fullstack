import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import Button from '../components/Button'
import Card from '../components/Card'
import Badge from '../components/Badge'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import VehicleArt from '../components/VehicleArt'
import VehiclePhoto from '../components/VehiclePhoto'
import { ListSkeleton } from '../components/Skeleton'

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
  // The listing the person pressed "Delete" on. While this is set, the
  // "Are you sure?" window is open. null = window closed.
  const [vehiclePendingDelete, setVehiclePendingDelete] = useState(null)

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

  // Only runs after the person confirms in the "Are you sure?" window.
  // Returns true if it worked, so the window knows whether to close.
  async function deleteListing(vehicleId) {
    try {
      const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (!res.ok) return false
      setListings(listings.filter((l) => l.id !== vehicleId))
      return true
    } catch {
      return false
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
  const boostedCount = listings.filter((l) => l.featured).length
  const pendingOffersCount = offers.filter((o) => o.status === 'pending').length

  // Offers still waiting for a reply go first, so the seller sees them straight away.
  // (sort keeps the original order inside each group.)
  const sortedOffers = [...offers].sort(
    (a, b) => Number(b.status === 'pending') - Number(a.status === 'pending')
  )

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Seller Dashboard</h1>

      <p className="text-sm text-textmuted mt-1">Manage your listings and reply to buyers' offers.</p>

      {/* "Offers waiting" turns amber when a buyer is waiting for a reply.
          While data is still loading, the cards show "–" instead of a wrong
          "0", and the small hint line is blank (a non-breaking space keeps
          its height, so the cards don't grow when the numbers arrive). */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
        <StatCard
          label="Offers waiting"
          value={offersLoading ? '–' : pendingOffersCount}
          hint={offersLoading ? '\u00A0' : pendingOffersCount > 0 ? 'Reply below' : 'All caught up'}
          attention={pendingOffersCount > 0}
        />
        <StatCard label="Active listings" value={loading ? '–' : activeCount} hint={loading ? '\u00A0' : `${pausedCount} paused`} />
        <StatCard
          label="Sold"
          value={loading ? '–' : soldCount}
          hint={loading ? '\u00A0' : soldCount === 1 ? '1 bike sold' : `${soldCount} bikes sold`}
        />
        <StatCard label="Total listings" value={loading ? '–' : totalCount} hint={loading ? '\u00A0' : `${boostedCount} boosted`} />
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display font-bold text-xl">Offers Received</h2>
          {pendingOffersCount > 0 && (
            <Badge variant="warning" dot>
              {pendingOffersCount} waiting for reply
            </Badge>
          )}
        </div>
        {offersLoading ? (
          // 2 grey rows shaped like offer cards (no picture, same as the real ones).
          <div className="mt-4">
            <ListSkeleton rows={2} label="Loading offers" thumbnail={false} />
          </div>
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
            {sortedOffers.map((offer) => (
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
          // 3 grey rows shaped like listing rows (picture, name, status).
          <div className="mt-4">
            <ListSkeleton rows={3} label="Loading your listings" />
          </div>
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
                  <div className="flex-1 flex items-center gap-3 min-w-0">
                    <ListingThumbnail vehicle={vehicle} />
                    <div className="min-w-0">
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
                    <Button variant="danger" size="sm" onClick={() => setVehiclePendingDelete(vehicle)}>
                      Delete
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {vehiclePendingDelete && (
        <ConfirmDeleteDialog
          vehicle={vehiclePendingDelete}
          onConfirm={() => deleteListing(vehiclePendingDelete.id)}
          onClose={() => setVehiclePendingDelete(null)}
        />
      )}
    </div>
  )
}

const artBackgrounds = {
  orange: 'linear-gradient(160deg,#FDECE0,#F6C79B)',
  blue: 'linear-gradient(160deg,#E7EDFB,#B9C8F0)',
  graphite: 'linear-gradient(160deg,#EDEEF0,#C7CACF)',
  teal: 'linear-gradient(160deg,#E1F4EE,#A9DCCB)',
}

// Small picture on each listing row: the cover photo, or the bike drawing for old listings.
function ListingThumbnail({ vehicle }) {
  const coverPhoto = vehicle.photos?.[0]
  return (
    <div
      className="relative w-20 h-16 shrink-0 rounded-ctl overflow-hidden"
      style={{ background: artBackgrounds[vehicle.artColor] }}
    >
      {coverPhoto ? (
        <VehiclePhoto photo={coverPhoto} width={160} alt="" />
      ) : (
        <VehicleArt type={vehicle.type} color={vehicle.artColor} />
      )}
    </div>
  )
}

// The "Are you sure?" window shown before a listing is deleted.
// Deleting can't be undone, so we ask once more and say exactly what will happen.
function ConfirmDeleteDialog({ vehicle, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const title = `${vehicle.brand} ${vehicle.model}`

  // Pressing Escape closes the window (but not while the delete is running).
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !deleting) onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [deleting, onClose])

  async function handleDelete() {
    setDeleting(true)
    setError('')
    const worked = await onConfirm()
    if (worked) {
      onClose()
    } else {
      setDeleting(false)
      setError("Couldn't delete this listing. Please try again.")
    }
  }

  return (
    // The dark background. Clicking it closes the window, like pressing Cancel.
    <div
      className="fixed inset-0 bg-ink/50 flex items-end sm:items-center justify-center z-[60] p-4"
      onClick={() => !deleting && onClose()}
    >
      <Card
        padding="lg"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-message"
        className="w-full max-w-[420px] shadow-pop"
        // Clicks inside the white box should NOT reach the dark background.
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-11 h-11 rounded-full bg-dangerbg text-danger flex items-center justify-center">
          <TrashIcon />
        </div>
        <h2 id="delete-dialog-title" className="font-display font-bold text-xl mt-4">
          Delete this listing?
        </h2>
        <p id="delete-dialog-message" className="text-sm text-textmuted mt-2">
          Your <span className="font-semibold text-ink">{title}</span> listing and its photos will be removed for
          good. Buyers won't see it anymore, and this can't be undone.
        </p>
        {vehicle.status !== 'sold' && (
          <p className="text-sm text-textmuted mt-2">
            Sold it? Use <span className="font-semibold text-ink">Mark Sold</span> instead to keep a record.
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-4">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose} disabled={deleting} autoFocus>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={deleting}>
            {deleting ? 'Deleting...' : 'Yes, delete it'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
    </svg>
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
import { useState, useEffect } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'
import Badge, { VehicleTypeBadge } from '../components/Badge'
import Button from '../components/Button'
import Card from '../components/Card'
import EmptyState from '../components/EmptyState'
import { ListSkeleton } from '../components/Skeleton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const offerStatus = {
  pending: { label: 'Pending', variant: 'warning' },
  accepted: { label: 'Accepted', variant: 'success' },
  rejected: { label: 'Rejected', variant: 'neutral' },
  countered: { label: 'Countered', variant: 'info' },
}

function MyOffers() {
  useDocumentTitle('My Offers')
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  useEffect(() => {
    async function loadOffers() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`${API_URL}/offers/sent`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        })
        if (!res.ok) throw new Error('Failed to load offers')
        setOffers(await res.json())
      } catch {
        setError("Couldn't load your offers. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadOffers()
  }, [user, retryCount])

  if (!user) {
    return (
      <div className="max-w-[560px] mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          title="Log in to see your offers"
          message="Your offers and the seller's replies show up here."
          actionLabel="Log In"
          actionTo="/login"
        />
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">My Offers</h1>
      {loading ? (
        // 3 grey rows shaped like offer cards (no picture, same as the real ones).
        <div className="mt-4">
          <ListSkeleton rows={3} label="Loading your offers" thumbnail={false} />
        </div>
      ) : error ? (
        <Card padding="lg" className="mt-6 text-center">
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
          <div className="mt-4">
            <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
          </div>
        </Card>
      ) : offers.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            title="You haven't made any offers yet"
            message="Found a bike or car you like? Open it and tap Make an Offer."
            actionLabel="Browse Vehicles"
            actionTo="/vehicles"
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {offers.map((offer) => (
            <MyOfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}

function MyOfferCard({ offer }) {
  const [rated, setRated] = useState(false)
  const [alreadyRated, setAlreadyRated] = useState(false)
  const [showRateForm, setShowRateForm] = useState(false)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const s = offerStatus[offer.status]

  async function handleRate(e) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const token = localStorage.getItem('bikebazar_token')
      const res = await fetch(`${API_URL}/ratings/${offer.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stars, comment }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit rating')
      setRated(true)
      setShowRateForm(false)
    } catch (err) {
      // The server already has a rating for this deal (for example from an
      // earlier visit) — say so kindly instead of showing an error.
      if (/already rated/i.test(err.message)) {
        setAlreadyRated(true)
        setShowRateForm(false)
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card padding="sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-semibold flex flex-wrap items-center gap-2">
            {offer.vehicle.brand} {offer.vehicle.model}
            <VehicleTypeBadge vehicleType={offer.vehicle.vehicleType} />
          </p>
          <p className="text-sm text-textmuted mt-0.5">Your offer: Rs. {offer.amount.toLocaleString('en-IN')}</p>
          {offer.status === 'countered' && (
            <p className="text-sm text-accent mt-1">
              Seller's counter: Rs. {offer.counterAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <Badge variant={s.variant} dot>
          {s.label}
        </Badge>
      </div>

      {offer.status === 'accepted' && !rated && !alreadyRated && (
        <div className="mt-3">
          {!showRateForm ? (
            <Button size="sm" onClick={() => setShowRateForm(true)}>
              Rate This Seller
            </Button>
          ) : (
            <form onSubmit={handleRate} className="border border-bordercol rounded-cardsm p-3 mt-2">
              <p className="text-sm font-semibold mb-1.5">Rating</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-pressed={n <= stars}
                    className={`text-2xl leading-none p-1 ${n <= stars ? 'text-featured' : 'text-bordercol'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment about the seller..."
                className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm mt-2 bg-white"
                rows={2}
              />
              {error && <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-2">{error}</p>}
              <div className="flex gap-2 mt-2">
                <Button type="submit" size="sm" loading={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setShowRateForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
      {rated && <p className="text-sm text-success font-semibold mt-3">✓ Thanks for rating this seller!</p>}
      {alreadyRated && <p className="text-sm text-textmuted mt-3">✓ You've already rated this seller.</p>}
    </Card>
  )
}

export default MyOffers
import { useState, useEffect } from 'react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useAuth } from '../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const statusBadge = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warningbg' },
  accepted: { label: 'Accepted', color: 'text-success', bg: 'bg-successbg' },
  rejected: { label: 'Rejected', color: 'text-neutralbadge', bg: 'bg-neutralbadgebg' },
  countered: { label: 'Countered', color: 'text-accent', bg: 'bg-accentsoftbg' },
}

function MyOffers() {
  useDocumentTitle('My Offers')
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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
  }, [user])

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Log In to View Your Offers</h1>
      </div>
    )
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">My Offers</h1>
      {loading ? (
        <p className="text-textmuted text-sm mt-4">Loading your offers...</p>
      ) : error ? (
        <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-4 inline-block">{error}</p>
      ) : offers.length === 0 ? (
        <p className="text-textmuted text-sm mt-4">You haven't made any offers yet.</p>
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
  const [showRateForm, setShowRateForm] = useState(false)
  const [stars, setStars] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const s = statusBadge[offer.status]

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
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-bordercol rounded-card p-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="font-display font-semibold">
            {offer.vehicle.brand} {offer.vehicle.model}
          </p>
          <p className="text-sm text-textmuted mt-0.5">Your offer: Rs. {offer.amount.toLocaleString('en-IN')}</p>
          {offer.status === 'countered' && (
            <p className="text-sm text-accent mt-1">
              Seller's counter: Rs. {offer.counterAmount.toLocaleString('en-IN')}
            </p>
          )}
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-badge shrink-0 ${s.color} ${s.bg}`}>
          {s.label}
        </span>
      </div>

      {offer.status === 'accepted' && !rated && (
        <div className="mt-3">
          {!showRateForm ? (
            <button
              onClick={() => setShowRateForm(true)}
              className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-accent text-white"
            >
              Rate This Seller
            </button>
          ) : (
            <form onSubmit={handleRate} className="border border-bordercol rounded-cardsm p-3 mt-2">
              <label className="text-sm font-semibold block mb-1.5">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className={`text-2xl ${n <= stars ? 'text-warning' : 'text-bordercol'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Optional comment about the seller..."
                className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm mt-2"
                rows={2}
              />
              {error && <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 mt-2">{error}</p>}
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-accent text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Rating'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRateForm(false)}
                  className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
      {rated && <p className="text-sm text-success font-semibold mt-3">✓ Thanks for rating this seller!</p>}
    </div>
  )
}

export default MyOffers
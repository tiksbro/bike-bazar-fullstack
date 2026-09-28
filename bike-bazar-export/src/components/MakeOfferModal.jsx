import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Button from './Button'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// Quick buttons that fill in the offer as "X% less than the asking price".
const QUICK_CUTS = [5, 10, 15]

function roundToThousand(n) {
  return Math.round(n / 1000) * 1000
}

function MakeOfferModal({ vehicle, onClose }) {
  const { user } = useAuth()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Pressing Escape closes the window.
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const offerNumber = Number(amount)
  const validAmount = offerNumber > 0
  const diffPercent = validAmount ? Math.round(((vehicle.price - offerNumber) / vehicle.price) * 100) : 0

  let hint = ''
  if (validAmount) {
    if (diffPercent > 0) hint = `${diffPercent}% below the asking price`
    else if (diffPercent < 0) hint = 'above the asking price'
    else hint = 'about the asking price'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validAmount) return
    setSubmitting(true)
    setError('')
    try {
      const token = localStorage.getItem('bikebazar_token')
      const res = await fetch(`${API_URL}/offers/${vehicle.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: offerNumber, message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send offer')
      setSuccess(true)
    } catch (err) {
      // A TypeError from fetch means the server could not be reached at all.
      setError(err instanceof TypeError ? "Couldn't reach the server. Check your connection and try again." : err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // z-[60] keeps this window above the Compare bar and the bottom menu.
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="offer-title"
        className="bg-white rounded-card shadow-pop p-6 max-w-[420px] w-full max-h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {!user ? (
          <div className="text-center">
            <h3 id="offer-title" className="font-display font-bold text-lg">
              Log in to make an offer
            </h3>
            <p className="text-sm text-textmuted mt-2">
              You need an account so the seller can see who the offer is from and reply to you.
            </p>
            <div className="flex gap-2 mt-5">
              <Button to="/login" className="flex-1">
                Log In
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </div>
        ) : success ? (
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-successbg text-success flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 id="offer-title" className="font-display font-bold text-lg mt-4">
              Offer sent!
            </h3>
            <p className="text-sm text-textmuted mt-2">
              The seller will see it on their dashboard and can accept, reject, or counter your offer. You can follow it
              under My Offers.
            </p>
            <div className="mt-5">
              <Button fullWidth onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <h3 id="offer-title" className="font-display font-bold text-lg">
              Make an Offer
            </h3>
            <p className="text-sm text-textmuted mt-1">
              {vehicle.brand} {vehicle.model} · asking Rs. {vehicle.price.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-5">
              <div>
                <label htmlFor="offer-amount" className="text-sm font-semibold block mb-1.5">
                  Your offer
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-textmuted">Rs.</span>
                  <input
                    id="offer-amount"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    autoFocus
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full border border-bordercol rounded-ctl pl-10 pr-3 py-2.5 text-sm bg-white"
                    placeholder="e.g. 290000"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {QUICK_CUTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(String(roundToThousand(vehicle.price * (1 - p / 100))))}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold text-textmuted ring-1 ring-inset ring-bordercol hover:ring-borderstrong transition"
                    >
                      {p}% less
                    </button>
                  ))}
                </div>
                {validAmount && (
                  <p className="text-xs text-textmuted mt-2">
                    <span className="font-semibold text-ink">Rs. {offerNumber.toLocaleString('en-IN')}</span> · {hint}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="offer-message" className="text-sm font-semibold block mb-1.5">
                  Message <span className="font-normal text-textfaint">(optional)</span>
                </label>
                <textarea
                  id="offer-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm bg-white"
                  rows={3}
                  placeholder="Anything you'd like the seller to know..."
                />
              </div>

              {error && <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2">{error}</p>}

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" loading={submitting} disabled={!validAmount}>
                  {submitting ? 'Sending...' : 'Send Offer'}
                </Button>
                <Button variant="secondary" onClick={onClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default MakeOfferModal
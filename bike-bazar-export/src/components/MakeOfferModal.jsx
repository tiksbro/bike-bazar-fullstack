import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

function MakeOfferModal({ vehicle, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      navigate('/login')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const token = localStorage.getItem('bikebazar_token')
      const res = await fetch(`${API_URL}/offers/${vehicle.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount: Number(amount), message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send offer')
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-card p-6 max-w-[400px] w-full" onClick={(e) => e.stopPropagation()}>
        {success ? (
          <div className="text-center">
            <p className="font-display font-bold text-lg text-success">Offer Sent!</p>
            <p className="text-sm text-textmuted mt-2">
              The seller will be notified and can accept, reject, or counter your offer.
            </p>
            <button
              onClick={onClose}
              className="mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-2.5"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-display font-bold text-lg">Make an Offer</h3>
            <p className="text-sm text-textmuted mt-1">
              {vehicle.brand} {vehicle.model} — listed at Rs. {vehicle.price.toLocaleString('en-IN')}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-4">
              <div>
                <label className="text-sm font-semibold block mb-1.5">Your Offer (Rs.)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
                  placeholder="e.g. 290000"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold block mb-1.5">Message (optional)</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Anything you'd like the seller to know..."
                />
              </div>

              {error && <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2">{error}</p>}

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-2.5 disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Send Offer'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-sm font-semibold px-5 py-2.5 rounded-btn border border-bordercol"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default MakeOfferModal
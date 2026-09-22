import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listDealers } from '../services/dealerService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

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
        <p className="text-textmuted text-sm mt-6">Loading dealers...</p>
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
      ) : dealers.length === 0 ? (
        <p className="text-textmuted text-sm mt-6">No dealers registered yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {dealers.map((dealer) => (
            <Link
              key={dealer.id}
              to={`/dealer/${dealer.id}`}
              className="border border-bordercol rounded-card p-5 hover:border-borderstrong transition"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-bold text-lg">{dealer.businessName}</p>
                {dealer.verified && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-badge text-success bg-successbg shrink-0">
                    ✓ Verified
                  </span>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dealers
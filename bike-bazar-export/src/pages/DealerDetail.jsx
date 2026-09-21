import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDealerById } from '../services/dealerService'
import VehicleCard from '../components/VehicleCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function DealerDetail() {
  const { id } = useParams()
  const [dealer, setDealer] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDealer() {
      setLoading(true)
      const data = await getDealerById(id)
      setDealer(data)
      setLoading(false)
    }
    loadDealer()
  }, [id])

  useDocumentTitle(loading ? 'Loading...' : dealer ? dealer.businessName : 'Dealer Not Found')

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-textmuted">Loading dealer...</p>
      </div>
    )
  }

  if (!dealer) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Dealer Not Found</h1>
        <Link to="/dealers" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Browse Dealers
        </Link>
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
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-badge text-success bg-successbg shrink-0">
            ✓ Verified Dealer
          </span>
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
        <p className="text-textmuted text-sm mt-4">This dealer has no active listings right now.</p>
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

export default DealerDetail
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDealerBySlug } from '../services/dealerService'
import { getVehicleBySlug } from '../services/vehicleService'
import VehicleCard from '../components/VehicleCard'

function DealerDetail() {
  const { slug } = useParams()
  const dealer = getDealerBySlug(slug)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      const results = await Promise.all(
        dealer ? dealer.vehicleSlugs.map((slug) => getVehicleBySlug(slug)) : []
      )
      setVehicles(results.filter(Boolean))
      setLoading(false)
    }
    loadVehicles()
  }, [dealer])

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

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-textmuted">Loading dealer...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dealers" className="text-sm text-accent font-semibold hover:underline">← Back to dealers</Link>

      <div className="flex items-start justify-between mt-4 gap-2">
        <div>
          <h1 className="font-display font-bold text-[26px]">{dealer.name}</h1>
          <p className="text-textmuted mt-1">{dealer.city}</p>
          <p className="text-sm mt-1">
            ⭐ {dealer.rating} <span className="text-textfaint">({dealer.reviewCount} reviews)</span>
          </p>
        </div>
        {dealer.verified && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-badge text-success bg-successbg shrink-0">
            ✓ Verified Dealer
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-4">
        {dealer.brands.map((brand) => (
          <span key={brand} className="text-xs bg-sunken px-2 py-1 rounded-badge">
            {brand}
          </span>
        ))}
      </div>

      <h2 className="font-display font-bold text-xl mt-10">Available Vehicles</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} variant="result" />
        ))}
      </div>
    </div>
  )
}

export default DealerDetail
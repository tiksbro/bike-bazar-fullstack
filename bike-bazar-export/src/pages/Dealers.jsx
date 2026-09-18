import { Link } from 'react-router-dom'
import { listDealers } from '../services/dealerService'

function Dealers() {
  const dealers = listDealers()

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Verified Dealers</h1>
      <p className="text-textmuted text-sm mt-1">Browse trusted multi-brand showrooms across Nepal.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
        {dealers.map((dealer) => (
          <Link
            key={dealer.id}
            to={`/dealer/${dealer.slug}`}
            className="border border-bordercol rounded-card p-5 hover:border-borderstrong transition"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-display font-bold text-lg">{dealer.name}</p>
              {dealer.verified && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-badge text-success bg-successbg shrink-0">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-sm text-textmuted mt-1">{dealer.city}</p>
            <p className="text-sm mt-1">
              ⭐ {dealer.rating} <span className="text-textfaint">({dealer.reviewCount} reviews)</span>
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {dealer.brands.map((brand) => (
                <span key={brand} className="text-xs bg-sunken px-2 py-1 rounded-badge">
                  {brand}
                </span>
              ))}
            </div>

            <p className="text-sm text-textmuted mt-3">{dealer.vehicleSlugs.length} vehicles available</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Dealers
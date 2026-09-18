import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import { listVehicles } from '../services/vehicleService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { citiesByProvince } from '../data/cities'

const brands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

function Browse() {
  useDocumentTitle('Browse Vehicles')

  const [searchParams] = useSearchParams()

  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    brand: searchParams.get('brand') || '',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : '',
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : '',
    sortBy: '',
  })

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  function updateFilter(field, value) {
    setFilters({ ...filters, [field]: value })
  }

  // Dependency array is [filters] this time, not [] — every time ANY
  // filter changes (typing in search, picking a brand, etc.), `filters`
  // becomes a new object, so this runs again and asks the backend for
  // freshly filtered results. This is actually how it SHOULD work with
  // a real API: filtering happens on the server, not in the browser.
  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      const data = await listVehicles(filters)
      setResults(data)
      setLoading(false)
    }
    loadResults()
  }, [filters])

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Browse Vehicles</h1>
      <p className="text-textmuted text-sm mt-1">
        {loading ? 'Searching...' : `${results.length} vehicles found`}
      </p>

      <div className="grid md:grid-cols-[260px_1fr] gap-8 mt-6">
        <aside className="flex flex-col gap-5">
          <div>
            <label className="text-sm font-semibold block mb-1.5">Search</label>
            <input
              type="text"
              value={filters.q}
              onChange={(e) => updateFilter('q', e.target.value)}
              placeholder="Brand or model"
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Type</label>
            <div className="flex gap-2">
              {['', 'motorcycle', 'scooter'].map((t) => (
                <button
                  key={t || 'all'}
                  onClick={() => updateFilter('type', t)}
                  className={`text-sm px-3 py-1.5 rounded-full border ${
                    filters.type === t ? 'bg-ink text-white border-ink' : 'border-bordercol'
                  }`}
                >
                  {t === '' ? 'All' : t === 'motorcycle' ? 'Motorcycle' : 'Scooter'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Brand</label>
            <select
              value={filters.brand}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            >
              <option value="">All brands</option>
              {brands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Location</label>
            <select
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            >
              <option value="">All locations</option>
              {Object.entries(citiesByProvince).map(([province, provinceCities]) => (
                <optgroup key={province} label={province}>
                  {provinceCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1.5">Sort by</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full border border-bordercol rounded-ctl px-3 py-2 text-sm"
            >
              <option value="">Newest</option>
              <option value="priceLowHigh">Price: Low → High</option>
              <option value="priceHighLow">Price: High → Low</option>
              <option value="lowestKm">Lowest KM</option>
            </select>
          </div>
        </aside>

        <div>
          {loading ? (
            <p className="text-textmuted text-sm">Loading vehicles...</p>
          ) : results.length === 0 ? (
            <p className="text-textmuted text-sm">No vehicles match these filters. Try clearing one.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} variant="result" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Browse
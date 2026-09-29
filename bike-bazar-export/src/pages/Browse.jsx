import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import VehicleCard from '../components/VehicleCard'
import { listVehicles } from '../services/vehicleService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { citiesByProvince } from '../data/cities'
import Button from '../components/Button'
import EmptyState from '../components/EmptyState'

const brands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

const emptyFilters = { q: '', brand: '', type: '', location: '', minPrice: '', maxPrice: '', sortBy: '' }

// The actual filter inputs, in one place. Rendered twice — once inside
// the always-visible desktop sidebar, once inside the mobile slide-up
// panel — so both stay in sync without duplicating the fields.
function FilterFields({ filters, updateFilter }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-sm font-semibold block mb-1.5">Search</label>
        <input
          type="text"
          value={filters.q}
          onChange={(e) => updateFilter('q', e.target.value)}
          placeholder="Brand or model"
          className="w-full border border-bordercol focus:border-accent rounded-ctl px-3 py-2 text-sm outline-none bg-white"
        />
      </div>

      <div>
        <label className="text-sm font-semibold block mb-1.5">Type</label>
        <div className="flex gap-2">
          {['', 'motorcycle', 'scooter'].map((t) => (
            <button
              key={t || 'all'}
              type="button"
              onClick={() => updateFilter('type', t)}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                filters.type === t ? 'bg-ink text-white border-ink' : 'border-bordercol hover:border-borderstrong'
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
          className="w-full border border-bordercol focus:border-accent rounded-ctl px-3 py-2 text-sm bg-white"
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
          className="w-full border border-bordercol focus:border-accent rounded-ctl px-3 py-2 text-sm bg-white"
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
          className="w-full border border-bordercol focus:border-accent rounded-ctl px-3 py-2 text-sm bg-white"
        >
          <option value="">Newest</option>
          <option value="priceLowHigh">Price: Low → High</option>
          <option value="priceHighLow">Price: High → Low</option>
          <option value="lowestKm">Lowest KM</option>
        </select>
      </div>
    </div>
  )
}

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
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  function updateFilter(field, value) {
    setFilters({ ...filters, [field]: value })
  }

  function clearFilters() {
    setFilters(emptyFilters)
  }

  // How many filters are actually narrowing the results right now —
  // shown as a small count on the mobile "Filters" button, so you know
  // at a glance whether anything is applied without opening the panel.
  const activeFilterCount = ['q', 'brand', 'type', 'location'].filter((k) => filters[k]).length

  // Pressing Escape closes the mobile filter panel, same as the offer window.
  useEffect(() => {
    if (!showMobileFilters) return
    function onKey(e) {
      if (e.key === 'Escape') setShowMobileFilters(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [showMobileFilters])

  // Dependency array is [filters] this time, not [] — every time ANY
  // filter changes (typing in search, picking a brand, etc.), `filters`
  // becomes a new object, so this runs again and asks the backend for
  // freshly filtered results. This is actually how it SHOULD work with
  // a real API: filtering happens on the server, not in the browser.
  useEffect(() => {
    async function loadResults() {
      setLoading(true)
      setError('')
      try {
        const data = await listVehicles(filters)
        setResults(data)
      } catch {
        setError("Couldn't load vehicles. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadResults()
  }, [filters, retryCount])

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Browse Vehicles</h1>
      <p className="text-textmuted text-sm mt-1">
        {loading ? 'Searching...' : `${results.length} vehicles found`}
      </p>

      {/* Phone only: a single "Filters" button instead of the long list
          of fields, so real listings show up right away without
          scrolling past every filter first. */}
      <div className="flex items-center gap-2 md:hidden mt-4">
        <Button variant="secondary" size="sm" onClick={() => setShowMobileFilters(true)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </Button>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-[260px_1fr] gap-8 mt-4 md:mt-6">
        <aside className="hidden md:flex flex-col gap-5">
          <FilterFields filters={filters} updateFilter={updateFilter} />
        </aside>

        <div>
          {loading ? (
            <p className="text-textmuted text-sm">Loading vehicles...</p>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
              <div className="mt-4">
                <Button onClick={() => setRetryCount((c) => c + 1)}>Try Again</Button>
              </div>
            </div>
          ) : results.length === 0 ? (
            <EmptyState
              title="No vehicles match these filters"
              message="Try clearing a filter to see more results."
              actionLabel={activeFilterCount > 0 ? 'Clear Filters' : undefined}
              onAction={activeFilterCount > 0 ? clearFilters : undefined}
            />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} variant="result" />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phone only: the filter panel, slides up from the bottom. */}
      {showMobileFilters && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-filters-title"
          className="fixed inset-0 z-[60] md:hidden"
        >
          <div className="absolute inset-0 bg-ink/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-[20px] shadow-pop max-h-[85vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 id="mobile-filters-title" className="font-display font-bold text-lg">
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setShowMobileFilters(false)}
                aria-label="Close filters"
                className="p-1.5 text-textmuted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <FilterFields filters={filters} updateFilter={updateFilter} />

            <div className="flex gap-2 mt-6">
              {activeFilterCount > 0 && (
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    clearFilters()
                    setShowMobileFilters(false)
                  }}
                >
                  Clear all
                </Button>
              )}
              <Button className="flex-1" onClick={() => setShowMobileFilters(false)}>
                {loading ? 'Show results' : `Show ${results.length} results`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Browse
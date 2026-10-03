import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import VehicleTabs from './VehicleTabs'
import { getBrands } from '../services/vehicleService'

// Only used if the real brand list can't be loaded. Normally the Brand pill
// asks the backend for the brands of the picked tab (same as Browse).
const fallbackBikeBrands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

// Cars cost a lot more than bikes, so each tab gets its own budget steps.
const budgetOptions = {
  bike: [
    { label: 'Under Rs. 1 Lakh', params: { maxPrice: 100000 } },
    { label: 'Rs. 1-2 Lakh', params: { minPrice: 100000, maxPrice: 200000 } },
    { label: 'Rs. 2-3 Lakh', params: { minPrice: 200000, maxPrice: 300000 } },
    { label: 'Rs. 3-5 Lakh', params: { minPrice: 300000, maxPrice: 500000 } },
    { label: 'Above Rs. 5 Lakh', params: { minPrice: 500000 } },
  ],
  car: [
    { label: 'Under Rs. 20 Lakh', params: { maxPrice: 2000000 } },
    { label: 'Rs. 20-35 Lakh', params: { minPrice: 2000000, maxPrice: 3500000 } },
    { label: 'Rs. 35-50 Lakh', params: { minPrice: 3500000, maxPrice: 5000000 } },
    { label: 'Rs. 50-75 Lakh', params: { minPrice: 5000000, maxPrice: 7500000 } },
    { label: 'Above Rs. 75 Lakh', params: { minPrice: 7500000 } },
  ],
}

const locationOptions = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Birgunj', 'Dharan', 'Itahari',
  'Butwal', 'Nepalgunj', 'Janakpur', 'Dhangadhi', 'Hetauda', 'Ghorahi', 'Tulsipur', 'Kalaiya', 'Jitpur Simara',
]

// The "Vehicle Type" pill: Motorcycle/Scooter for bikes, body types for cars.
// Same values the backend and the Browse page use.
const typeOptions = {
  bike: [
    { label: 'Motorcycle', params: { type: 'motorcycle' } },
    { label: 'Scooter', params: { type: 'scooter' } },
  ],
  car: [
    { label: 'Hatchback', params: { type: 'hatchback' } },
    { label: 'Sedan', params: { type: 'sedan' } },
    { label: 'SUV', params: { type: 'suv' } },
    { label: 'MUV', params: { type: 'muv' } },
    { label: 'Pickup', params: { type: 'pickup' } },
  ],
}

// Builds the four pills (Brand, Budget, Location, Vehicle Type) for one tab.
// This used to be a fixed list; now it's a function because the
// choices depend on which tab is picked.
function buildFilterConfigs(vehicle, brands) {
  return [
    {
      key: 'brand',
      label: 'Brand',
      options: [{ label: 'All Brands', params: {} }, ...brands.map((b) => ({ label: b, params: { brand: b } }))],
    },
    {
      key: 'budget',
      label: 'Budget',
      options: budgetOptions[vehicle],
    },
    {
      key: 'location',
      label: 'Location',
      options: locationOptions.map((c) => ({ label: c, params: { location: c } })),
    },
    {
      key: 'type',
      label: vehicle === 'car' ? 'Body Type' : 'Vehicle Type',
      options: [{ label: 'All Types', params: {} }, ...typeOptions[vehicle]],
    },
  ]
}

// Turns { brand: 'Honda' } into "/vehicles?brand=Honda".
// On the Cars tab it adds vehicle=car first, so Browse opens on Cars.
// Bikes is Browse's default, so bike links don't need it.
function vehiclesUrl(vehicle, params = {}) {
  const searchParams = new URLSearchParams()
  if (vehicle === 'car') searchParams.set('vehicle', 'car')
  Object.entries(params).forEach(([key, value]) => searchParams.set(key, value))
  const qs = searchParams.toString()
  return qs ? `/vehicles?${qs}` : '/vehicles'
}

function Hero() {
  const [query, setQuery] = useState('')
  const [openFilter, setOpenFilter] = useState(null)
  // Which tab is picked above the search box. Bikes first, like Browse.
  // Plain useState is fine here: the Home page URL doesn't need to remember it.
  const [vehicle, setVehicle] = useState('bike')
  // Brand lists we already loaded, saved by tab: { bike: [...], car: [...] }
  // so switching back and forth doesn't ask the backend again.
  const [brandsByVehicle, setBrandsByVehicle] = useState({})
  const navigate = useNavigate()

  // Remembers which tabs we already asked the backend about, so each
  // list is fetched only once. useRef keeps a value between renders
  // without causing a re-render when it changes.
  const requestedBrands = useRef(new Set())

  useEffect(() => {
    if (requestedBrands.current.has(vehicle)) return
    requestedBrands.current.add(vehicle)
    getBrands(vehicle)
      .then((list) => {
        // Saved under its own tab name, so a late answer can't end up on the wrong tab.
        setBrandsByVehicle((current) => ({ ...current, [vehicle]: list }))
      })
      .catch(() => {
        // Keep the fallback below. Search still works without it.
      })
  }, [vehicle])

  const loadedBrands = brandsByVehicle[vehicle]
  const brands =
    loadedBrands && loadedBrands.length > 0 ? loadedBrands : vehicle === 'bike' ? fallbackBikeBrands : []
  const filterConfigs = buildFilterConfigs(vehicle, brands)

  function switchVehicle(nextVehicle) {
    setVehicle(nextVehicle)
    // A pill menu that was open belongs to the old tab, so close it.
    setOpenFilter(null)
  }

  function handleSearch(e) {
    e.preventDefault()
    const q = query.trim()
    navigate(vehiclesUrl(vehicle, q ? { q } : {}))
  }

  function togglePill(key) {
    setOpenFilter((prev) => (prev === key ? null : key))
  }

  function goToVehicles(params) {
    navigate(vehiclesUrl(vehicle, params))
    setOpenFilter(null)
  }

  return (
    <section className="relative min-h-[520px] sm:min-h-[480px] lg:h-[440px] py-12 lg:py-0">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg,#2A2350 0%, #5C3A63 38%, #C9683E 72%, #E8A34C 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(10,12,16,.92), rgba(10,12,16,.72) 55%, rgba(10,12,16,.45))' }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-[780px]">
          <h1
            className="font-display font-bold text-white text-[36px] sm:text-[46px] lg:text-[58px]"
            style={{ lineHeight: 1.05, letterSpacing: '-0.025em' }}
          >
            Find Your Next Ride
          </h1>
          <p className="text-white/85 mt-4 text-base lg:text-[19px]" style={{ lineHeight: 1.5 }}>
            Buy, sell, compare and discover vehicles across Nepal.
          </p>

          {/* Bikes | Cars switch. Search, the pills below and the
              Browse button all follow the picked tab. */}
          <VehicleTabs value={vehicle} onChange={switchVehicle} tone="dark" className="mt-6" />

          <form onSubmit={handleSearch} className="mt-3 bg-white rounded-card p-[10px] flex flex-col sm:flex-row gap-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center flex-1 px-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6F76" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={vehicle === 'car' ? 'Search cars by brand or model' : 'Search bikes by brand or model'}
                aria-label={vehicle === 'car' ? 'Search cars' : 'Search bikes'}
                className="w-full px-3 py-3 text-sm outline-none bg-transparent placeholder:text-textfaint"
              />
            </div>
            <button type="submit" className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-[30px] py-[13px]">
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            {filterConfigs.map((filter) => (
              <div key={filter.key} className="relative">
                <button
                  type="button"
                  onClick={() => togglePill(filter.key)}
                  aria-haspopup="true"
                  aria-expanded={openFilter === filter.key}
                  className="text-white rounded-full font-medium text-[13.5px] px-4 py-[9px]"
                  style={{ background: 'rgba(255,255,255,.10)', border: '1px solid rgba(255,255,255,.18)' }}
                >
                  {filter.label}
                </button>

                {openFilter === filter.key && (
                  <div className="absolute left-0 top-full mt-2 z-20 w-56 max-h-72 overflow-y-auto bg-white rounded-card shadow-[0_18px_40px_rgba(0,0,0,0.25)] p-1.5">
                    {filter.options.map((opt) => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => goToVehicles(opt.params)}
                        className="w-full text-left text-ink text-sm rounded-ctl px-3 py-2 hover:bg-sunken transition"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={vehiclesUrl(vehicle)} className="bg-white text-ink font-semibold text-sm rounded-btn px-[22px] py-[13px] hover:bg-white/90 transition">
              {vehicle === 'car' ? 'Browse Cars' : 'Browse Bikes'}
            </a>
            <a href="/sell" className="border border-white/35 text-white font-semibold text-sm rounded-btn px-[22px] py-[13px] hover:border-white/60 transition">
              Sell Your Vehicle
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const brandOptions = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

const budgetOptions = [
  { label: 'Under Rs. 1 Lakh', params: { maxPrice: 100000 } },
  { label: 'Rs. 1-2 Lakh', params: { minPrice: 100000, maxPrice: 200000 } },
  { label: 'Rs. 2-3 Lakh', params: { minPrice: 200000, maxPrice: 300000 } },
  { label: 'Rs. 3-5 Lakh', params: { minPrice: 300000, maxPrice: 500000 } },
  { label: 'Above Rs. 5 Lakh', params: { minPrice: 500000 } },
]

const locationOptions = [
  'Kathmandu', 'Pokhara', 'Lalitpur', 'Bharatpur', 'Biratnagar', 'Birgunj', 'Dharan', 'Itahari',
  'Butwal', 'Nepalgunj', 'Janakpur', 'Dhangadhi', 'Hetauda', 'Ghorahi', 'Tulsipur', 'Kalaiya', 'Jitpur Simara',
]

const filterConfigs = [
  {
    key: 'brand',
    label: 'Brand',
    options: [{ label: 'All Brands', params: {} }, ...brandOptions.map((b) => ({ label: b, params: { brand: b } }))],
  },
  {
    key: 'budget',
    label: 'Budget',
    options: budgetOptions.map((b) => ({ label: b.label, params: b.params })),
  },
  {
    key: 'location',
    label: 'Location',
    options: locationOptions.map((c) => ({ label: c, params: { location: c } })),
  },
  {
    key: 'type',
    label: 'Vehicle Type',
    options: [
      { label: 'All Types', params: {} },
      { label: 'Motorcycle', params: { type: 'motorcycle' } },
      { label: 'Scooter', params: { type: 'scooter' } },
    ],
  },
]

function Hero() {
  const [query, setQuery] = useState('')
  const [openFilter, setOpenFilter] = useState(null)
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault()
    navigate(`/vehicles?q=${encodeURIComponent(query)}`)
  }

  function togglePill(key) {
    setOpenFilter((prev) => (prev === key ? null : key))
  }

  function goToVehicles(params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => searchParams.set(key, value))
    const qs = searchParams.toString()
    navigate(qs ? `/vehicles?${qs}` : '/vehicles')
    setOpenFilter(null)
  }

  return (
    <section className="relative overflow-hidden min-h-[520px] sm:min-h-[480px] lg:h-[440px] py-12 lg:py-0">
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

          <form onSubmit={handleSearch} className="mt-6 bg-white rounded-card p-[10px] flex flex-col sm:flex-row gap-2 shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
            <div className="flex items-center flex-1 px-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B6F76" strokeWidth="1.8">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by brand, model or keyword"
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
            <a href="/vehicles" className="bg-white text-ink font-semibold text-sm rounded-btn px-[22px] py-[13px] hover:bg-white/90 transition">
              Browse Vehicles
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

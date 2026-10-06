import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBrands } from '../services/vehicleService'
import { vehiclesUrl } from '../utils/vehiclesUrl'

// The 4 dropdown boxes under the Home search bar: Brand, Budget, Location, Type.
// Picking an option opens the Browse page already filtered.
// This code used to live inside Hero.jsx. It moved here so Hero stays short.
//
// Props:
//   vehicle  'bike' or 'car', the tab picked in the Hero

// Only used if the real brand list can't be loaded. Normally the Brand box
// asks the backend for the brands of the picked tab (same as Browse).
const fallbackBikeBrands = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

// Brand lists we already loaded, saved by tab: { bike: [...], car: [...] }.
// It lives OUTSIDE the component, so it is kept even when the component
// is rebuilt (Hero rebuilds it each time the tab changes, see Hero.jsx).
// That way each list is asked from the backend only once.
const brandCache = {}

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

// The "Type" box: Motorcycle/Scooter for bikes, body types for cars.
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

// Small line icons, one per box. They use currentColor, so they take
// the text color of the box.
const iconProps = {
  width: 17, height: 17, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

function BrandIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  )
}

function BudgetIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M16 15h2" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 21s-6-5.5-6-10a6 6 0 0 1 12 0c0 4.5-6 10-6 10z" />
      <circle cx="12" cy="11" r="2.2" />
    </svg>
  )
}

function TypeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="6" cy="16" r="3.5" />
      <circle cx="18" cy="16" r="3.5" />
      <path d="M6 16l4-7h4l4 7" />
    </svg>
  )
}

// Builds the four boxes for one tab. It's a function because the
// choices depend on which tab is picked.
function buildFilterConfigs(vehicle, brands) {
  return [
    {
      key: 'brand',
      label: 'Brand',
      Icon: BrandIcon,
      options: [{ label: 'All Brands', params: {} }, ...brands.map((b) => ({ label: b, params: { brand: b } }))],
    },
    {
      key: 'budget',
      label: 'Budget',
      Icon: BudgetIcon,
      options: budgetOptions[vehicle],
    },
    {
      key: 'location',
      label: 'Location',
      Icon: LocationIcon,
      options: locationOptions.map((c) => ({ label: c, params: { location: c } })),
    },
    {
      key: 'type',
      label: 'Type',
      Icon: TypeIcon,
      options: [{ label: 'All Types', params: {} }, ...typeOptions[vehicle]],
    },
  ]
}

function QuickFilters({ vehicle }) {
  // Which box has its menu open: 'brand', 'budget', ... or null for none.
  const [openFilter, setOpenFilter] = useState(null)
  // Start with the saved list if we already have one for this tab.
  const [loadedBrands, setLoadedBrands] = useState(brandCache[vehicle] ?? null)
  const navigate = useNavigate()
  // Points at the whole row of boxes, so we can tell if a click was inside it.
  const rowRef = useRef(null)

  // Load the brand list for this tab, if it isn't saved yet.
  useEffect(() => {
    if (brandCache[vehicle]) return
    let ignore = false
    getBrands(vehicle)
      .then((list) => {
        brandCache[vehicle] = list
        // "ignore" is true if the component was removed before the answer
        // came back. Then we must not update it.
        if (!ignore) setLoadedBrands(list)
      })
      .catch(() => {
        // Keep the fallback below. Search still works without it.
      })
    return () => {
      ignore = true
    }
  }, [vehicle])

  // Close the open menu when someone clicks anywhere outside the boxes.
  useEffect(() => {
    if (!openFilter) return
    function handleClick(e) {
      if (rowRef.current && !rowRef.current.contains(e.target)) setOpenFilter(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openFilter])

  const brands =
    loadedBrands && loadedBrands.length > 0 ? loadedBrands : vehicle === 'bike' ? fallbackBikeBrands : []
  const filterConfigs = buildFilterConfigs(vehicle, brands)

  function toggleBox(key) {
    setOpenFilter((prev) => (prev === key ? null : key))
  }

  function goToVehicles(params) {
    setOpenFilter(null)
    navigate(vehiclesUrl(vehicle, params))
  }

  return (
    // 2 boxes per row on phones (4 are too tight at 360px), 4 in one row from sm (640px).
    <div ref={rowRef} className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {filterConfigs.map(({ key, label, Icon, options }) => (
        <div key={key} className="relative">
          <button
            type="button"
            onClick={() => toggleBox(key)}
            aria-haspopup="true"
            aria-expanded={openFilter === key}
            className={`w-full flex items-center gap-2 bg-white border rounded-cardsm px-3 py-[11px] text-[14px] font-medium text-ink shadow-card transition ${
              openFilter === key ? 'border-accent' : 'border-bordercol hover:border-borderstrong'
            }`}
          >
            <span className="text-textmuted">
              <Icon />
            </span>
            <span className="flex-1 text-left truncate">{label}</span>
            {/* Down arrow. It turns upside down while the menu is open. */}
            <svg
              className={`shrink-0 text-textfaint transition ${openFilter === key ? 'rotate-180' : ''}`}
              width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {openFilter === key && (
            // inset-x-0: the menu is exactly as wide as its box, so it can
            // never stick out past the edge of a phone screen.
            <div className="absolute inset-x-0 top-full mt-1.5 z-20 max-h-72 overflow-y-auto bg-white border border-bordercol rounded-card shadow-pop p-1.5">
              {options.map((opt) => (
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
  )
}

export default QuickFilters

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// "1 listing" / "12 listings" / "..." while the numbers are still loading.
function listingCount(counts, key) {
  if (!counts) return '...'
  const n = counts[key] ?? 0
  return `${n.toLocaleString('en-IN')} ${n === 1 ? 'listing' : 'listings'}`
}

function CategoryCards() {
  const [counts, setCounts] = useState(null)

  useEffect(() => {
    async function loadCounts() {
      try {
        const res = await fetch(`${API_URL}/vehicles/stats/categories`)
        if (res.ok) {
          setCounts(await res.json())
        }
      } catch {
        // Silent failure — cards just keep showing "..." below rather
        // than breaking the whole homepage over one stats call.
      }
    }
    loadCounts()
  }, [])

  // Each card opens Browse already filtered. The first three are bike
  // counts (the backend's /stats/categories counts bikes only for these),
  // so their links open the Bikes tab. Cars opens the Cars tab.
  const categories = [
    { name: 'Motorcycles', count: listingCount(counts, 'motorcycles'), to: '/vehicles?type=motorcycle' },
    { name: 'Scooters', count: listingCount(counts, 'scooters'), to: '/vehicles?type=scooter' },
    { name: 'Electric', count: listingCount(counts, 'electric'), to: '/vehicles?fuelType=Electric' },
    { name: 'Cars', count: listingCount(counts, 'cars'), to: '/vehicles?vehicle=car', isNew: true },
  ]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 44 }}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px]">
        {categories.map((cat) => (
          // The whole card is one link, so it's easy to tap on a phone.
          <Link
            key={cat.name}
            to={cat.to}
            className="group relative block bg-white border border-bordercol rounded-card p-[22px] shadow-card transition hover:shadow-cardhover hover:border-borderstrong"
            style={{ minHeight: 112 }}
          >
            {cat.isNew ? (
              <span className="absolute top-4 right-4 text-[10.5px] font-bold px-2 py-0.5 rounded-badge text-accentsofttext bg-accentsoftbg">
                New
              </span>
            ) : (
              <span className="absolute top-4 right-4 text-[10.5px] font-bold flex items-center gap-1 text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Live
              </span>
            )}
            <p className="font-display font-semibold text-[18px] mt-6 flex items-center gap-1">
              {cat.name}
              {/* Small arrow that slides right on hover, a hint that the card is clickable.
                  Hidden on phones: "Motorcycles" already fills the narrow card there. */}
              <svg
                className="hidden sm:block shrink-0 text-textfaint transition group-hover:translate-x-0.5 group-hover:text-accent"
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </p>
            <p className="text-[13.5px] text-textmuted mt-0.5">{cat.count}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategoryCards

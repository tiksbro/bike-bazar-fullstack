import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VehicleArt from './VehicleArt'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

// "1 listing" / "12 listings" / "..." while the numbers are still loading.
function listingCount(counts, key) {
  if (!counts) return '...'
  const n = counts[key] ?? 0
  return `${n.toLocaleString('en-IN')} ${n === 1 ? 'listing' : 'listings'}`
}

// Small line icons for the round chip in the top-left corner of each card.
// They use currentColor, so they take the chip's text color.
const iconProps = {
  width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
}

function MotorcycleIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="5.5" cy="16" r="3.5" />
      <circle cx="18.5" cy="16" r="3.5" />
      <path d="M5.5 16l4-7h5l4 7" />
      <path d="M14.5 9l1.5-3h2" />
    </svg>
  )
}

function ScooterIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="6" cy="17" r="3" />
      <circle cx="18" cy="17" r="3" />
      <path d="M9 17h6l2-9h3" />
      <path d="M4 12h7l1 5" />
    </svg>
  )
}

function ElectricIcon() {
  return (
    <svg {...iconProps}>
      <path d="M13 3L5 14h6l-1 7 8-11h-6l1-7z" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 16v-3.5l2-4.5h9l4 4.5 3 .8V16" />
      <circle cx="7" cy="16.5" r="2.2" />
      <circle cx="17" cy="16.5" r="2.2" />
    </svg>
  )
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
  // art = which VehicleArt drawing to show, and in which color.
  const categories = [
    {
      name: 'Motorcycles',
      count: listingCount(counts, 'motorcycles'),
      to: '/vehicles?type=motorcycle',
      art: { type: 'motorcycle', color: 'blue' },
      Icon: MotorcycleIcon,
    },
    {
      name: 'Scooters',
      count: listingCount(counts, 'scooters'),
      to: '/vehicles?type=scooter',
      art: { type: 'scooter', color: 'blue' },
      Icon: ScooterIcon,
    },
    {
      // There is no separate electric drawing, so it's a scooter in teal
      // (green-blue is a common "electric" color) with a lightning icon.
      name: 'Electric',
      count: listingCount(counts, 'electric'),
      to: '/vehicles?fuelType=Electric',
      art: { type: 'scooter', color: 'teal' },
      Icon: ElectricIcon,
    },
    {
      name: 'Cars',
      count: listingCount(counts, 'cars'),
      to: '/vehicles?vehicle=car',
      art: { type: 'hatchback', color: 'blue' },
      Icon: CarIcon,
    },
  ]

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-12">
      {/* Section title with a "See all" link on the right, like the mockup. */}
      <div className="flex items-end justify-between gap-4 mb-4">
        <h2 className="font-display font-bold text-[22px] lg:text-[26px] text-ink">Explore by Category</h2>
        <Link to="/vehicles" className="flex items-center gap-1 text-[14px] font-semibold text-accent hover:text-accenthover transition shrink-0">
          See all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {/* 2 cards per row on phones, 4 in one row from md (768px). */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-[18px]">
        {categories.map(({ name, count, to, art, Icon }) => (
          // The whole card is one link, so it's easy to tap on a phone.
          // overflow-hidden keeps the picture area inside the rounded corners.
          <Link
            key={name}
            to={to}
            className="group block bg-white border border-bordercol rounded-card overflow-hidden shadow-card transition hover:shadow-cardhover hover:border-borderstrong"
          >
            {/* Picture area. "relative" is needed because VehicleArt draws
                with "absolute inset-0", which means: fill the nearest
                parent that is relative. aspect-[5/3] keeps the same shape
                on phones (a bit flatter on desktop, so the cards aren't too tall). */}
            <div className="relative aspect-[5/3] lg:aspect-[16/7] bg-gradient-to-b from-accentsoftbg to-sunken">
              <div className="absolute inset-x-[8%] inset-y-[6%] transition duration-300 group-hover:scale-105">
                <VehicleArt type={art.type} color={art.color} />
              </div>
              <span className="absolute top-2.5 left-2.5 w-8 h-8 rounded-full bg-white/90 text-accent flex items-center justify-center shadow-card">
                <Icon />
              </span>
            </div>

            <div className="px-3.5 py-3 sm:px-4 sm:py-3.5">
              <p className="font-display font-semibold text-[16px] sm:text-[17px] text-ink">{name}</p>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-[13px] sm:text-[13.5px] text-textmuted">{count}</p>
                {/* Small arrow that slides right on hover, a hint that the card is clickable. */}
                <svg
                  className="shrink-0 text-textfaint transition group-hover:translate-x-0.5 group-hover:text-accent"
                  width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CategoryCards

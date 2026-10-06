import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import VehicleTabs from './VehicleTabs'
import QuickFilters from './QuickFilters'
import { vehiclesUrl } from '../utils/vehiclesUrl'

// The top of the Home page: photo, heading, search bar, Bikes | Cars tabs,
// the 4 filter boxes (QuickFilters.jsx) and the Browse / Sell buttons.
//
// Layout, top to bottom:
//   1. Photo area: the heading sits on the sky, the vehicles show below it.
//      The glass Navbar floats on top of this area (it is "fixed").
//   2. The white search bar, pulled up so it overlaps the bottom of the photo.
//   3. On the light page: tabs + filter boxes, then the two buttons.

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

function SellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function Hero() {
  const [query, setQuery] = useState('')
  // Which tab is picked. Bikes first, like Browse.
  // Plain useState is fine here: the Home page URL doesn't need to remember it.
  const [vehicle, setVehicle] = useState('bike')
  const navigate = useNavigate()

  function handleSearch(e) {
    e.preventDefault() // stop the browser from reloading the page
    const q = query.trim()
    navigate(vehiclesUrl(vehicle, q ? { q } : {}))
  }

  const isCar = vehicle === 'car'

  return (
    <section className="relative">
      {/* 1. Photo area */}
      <div className="relative h-[440px] sm:h-[480px] lg:h-[560px] overflow-hidden">
        {/* A real <img> (not a CSS background) so the browser can start
            loading it early. alt="" because it is only decoration.
            object-cover fills the box without stretching. On phones the
            photo is cut, so object-[72%_center] keeps the vehicles in view
            (the empty left side is cut off instead). */}
        <img
          src="/hero.webp"
          alt=""
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover object-[72%_center] lg:object-center"
        />

        {/* Dark blue shade on top, so the white heading is easy to read.
            Phones: shade from the top. Desktop: shade from the left side,
            where the heading is. */}
        <div
          className="absolute inset-0 lg:hidden"
          style={{ background: 'linear-gradient(180deg, rgba(6,20,52,.82) 0%, rgba(6,20,52,.45) 40%, rgba(6,20,52,0) 62%)' }}
        />
        <div
          className="absolute inset-0 hidden lg:block"
          style={{ background: 'linear-gradient(90deg, rgba(6,20,52,.88) 0%, rgba(6,20,52,.55) 38%, rgba(6,20,52,0) 62%)' }}
        />
        {/* Soft fade into the light page color at the bottom (no hard edge). */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-pagebg" />

        {/* pt leaves room for the floating Navbar (about 76px on phones). */}
        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-[104px] lg:pt-[150px]">
          <h1
            className="font-display font-bold text-white text-[34px] sm:text-[46px] lg:text-[58px] max-w-[640px]"
            style={{ lineHeight: 1.08, letterSpacing: '-0.025em' }}
          >
            Find Your Next Ride
            {/* block = start on a new line. Light blue, like the mockup. */}
            <span className="block text-[#8DB4FF]">in Nepal.</span>
          </h1>
          <p className="text-white/90 mt-3 text-[15px] sm:text-base lg:text-[19px] max-w-[300px] sm:max-w-[520px]" style={{ lineHeight: 1.5 }}>
            Buy, sell and compare motorcycles, scooters and cars, all in one place.
          </p>
        </div>
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-2">
        <div className="max-w-[720px]">
          {/* 2. Search bar. -mt pulls it up over the bottom of the photo.
              Input and button stay in ONE row, even on small phones. */}
          <form
            onSubmit={handleSearch}
            className="-mt-[86px] sm:-mt-[96px] relative bg-white rounded-card p-2 flex items-center gap-2 shadow-[0_18px_40px_rgba(6,20,52,0.22)]"
          >
            <span className="pl-2 text-textmuted">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search brand or model"
              aria-label={isCar ? 'Search cars' : 'Search bikes'}
              // min-w-0 lets the input shrink on narrow phones instead of
              // pushing the Search button off the screen.
              className="flex-1 min-w-0 py-3 text-[15px] outline-none bg-transparent placeholder:text-textfaint"
            />
            <button
              type="submit"
              className="shrink-0 bg-accent hover:bg-accenthover transition text-white font-semibold text-[15px] rounded-btn px-5 sm:px-7 py-3 shadow-btn"
            >
              Search
            </button>
          </form>

          {/* 3. Tabs + filter boxes. Changing the tab changes the search,
              the filter choices and the Browse button. */}
          <VehicleTabs value={vehicle} onChange={setVehicle} className="mt-4" />
          <div className="mt-3">
            {/* key={vehicle}: when the tab changes, React builds a fresh
                QuickFilters, so a menu that was open for the old tab closes. */}
            <QuickFilters key={vehicle} vehicle={vehicle} />
          </div>

          {/* Link (not <a href>) changes the page without reloading the
              whole site, so it is faster and keeps the login state. */}
          <div className="mt-4 grid grid-cols-2 sm:flex gap-2.5 sm:gap-3">
            <Link
              to={vehiclesUrl(vehicle)}
              className="flex items-center justify-center gap-2 bg-accent hover:bg-accenthover transition text-white font-semibold text-[14.5px] rounded-btn px-3 sm:px-6 py-[13px] shadow-btn"
            >
              {isCar ? 'Browse Cars' : 'Browse Bikes'}
              <ArrowIcon />
            </Link>
            <Link
              to="/sell"
              className="flex items-center justify-center gap-2 bg-white border-[1.5px] border-accent text-accent hover:bg-accentsoftbg transition font-semibold text-[14.5px] rounded-btn px-3 sm:px-6 py-[13px]"
            >
              {/* The icon is hidden on the smallest phones to save space. */}
              <span className="hidden min-[380px]:block">
                <SellIcon />
              </span>
              Sell Your Vehicle
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import VehicleCard from './VehicleCard'
import { VehicleGridSkeleton } from './Skeleton'
import { getFeatured } from '../services/vehicleService'

// The most cards we show here: one row of 4 on desktop.
// "See all" opens Browse for the rest.
const MAX_CARDS = 4

// One set of classes for the row, used by the grey loading cards AND the
// real cards, so both have the same shape.
//
// Phones (below sm = 640px): a swipe row.
//   flex + overflow-x-auto   cards sit side by side and the row scrolls sideways
//   snap-x snap-mandatory    after a swipe, it stops neatly on a card
//   -mx-4 px-4               the row reaches the screen edges, but the first
//                            card still lines up with the title above
//   scroll-pl-4              the snap stop keeps that same 16px gap
//   [&>*]:...                "[&>*]" means "every direct child", so each
//                            card is 78% wide (the next one peeks in, a hint
//                            that you can swipe), never shrinks, and snaps
//   [scrollbar-width:none] + [&::-webkit-scrollbar]:hidden  hide the scrollbar
// From sm up: a normal grid (2 per row, then 4 per row from lg = 1024px).
const ROW_CLASS = [
  'mt-4 flex gap-3 overflow-x-auto snap-x snap-mandatory -mx-4 px-4 scroll-pl-4 pb-2',
  '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  '[&>*]:w-[78%] [&>*]:shrink-0 [&>*]:snap-start',
  'sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0 sm:[&>*]:w-auto',
].join(' ')

function FeaturedBikes() {
  // The vehicles (start empty, since we don't have them yet), whether
  // we're still waiting on them, and an error message if loading failed.
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // useEffect runs code that reaches OUTSIDE this component — here,
  // to the network. It runs once when the component first appears, and
  // again each time retryCount changes (the "Try Again" button).
  useEffect(() => {
    async function loadFeatured() {
      setLoading(true)
      setError('')
      try {
        const data = await getFeatured()
        setFeatured(data)
      } catch {
        setError("Couldn't load featured listings. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [retryCount])

  // Nothing is featured right now? Then hide the whole section instead of
  // showing an empty title.
  if (!loading && !error && featured.length === 0) return null

  // The heading is always shown, even while loading or after an error,
  // so the Home page keeps its shape. Only the part under the heading
  // changes: grey placeholder cards, an error box, or the real cards.
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-10 lg:mt-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          {/* "Listings", not "Bikes": featured cars show here too. */}
          <h2 className="font-display font-bold text-[22px] lg:text-[26px] text-ink">Featured Listings</h2>
          {/* Honest: these are boosted (promoted) listings. No "verified"
              promise until phone OTP really exists. */}
          <p className="text-[13.5px] text-textmuted mt-0.5">Boosted listings from sellers across Nepal</p>
        </div>
        <Link to="/vehicles" className="flex items-center gap-1 text-[14px] font-semibold text-accent hover:text-accenthover transition shrink-0">
          See all
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>

      {loading ? (
        // 4 grey cards in the same row/grid as the real ones below.
        <VehicleGridSkeleton count={4} className={ROW_CLASS} />
      ) : error ? (
        <div className="mt-4">
          <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
          <div>
            <button
              onClick={() => setRetryCount((c) => c + 1)}
              className="inline-flex mt-3 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <div className={ROW_CLASS}>
          {featured.slice(0, MAX_CARDS).map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} variant="featured" />
          ))}
        </div>
      )}
    </section>
  )
}

export default FeaturedBikes

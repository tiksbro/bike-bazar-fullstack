import { useState, useEffect } from 'react'
import VehicleCard from './VehicleCard'
import { getFeatured } from '../services/vehicleService'

function FeaturedBikes() {
  // Two pieces of memory: the vehicles themselves (start empty, since
  // we don't have them yet), and whether we're still waiting on them.
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  // useEffect runs code that reaches OUTSIDE this component — here,
  // to the network. The empty array [] at the end is the important
  // part: it means "run this once, right after this component first
  // appears on screen" — NOT on every re-render.
  useEffect(() => {
    async function loadFeatured() {
      setLoading(true)
      setError('')
      try {
        const data = await getFeatured()
        setFeatured(data)
      } catch {
        setError("Couldn't load featured bikes. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadFeatured()
  }, [retryCount])

  if (loading) {
    return <p className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-textmuted">Loading featured bikes...</p>
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
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
    )
  }

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8" style={{ marginTop: 52 }}>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-display font-bold text-[26px]">Featured Bikes</h2>
          <p className="text-[13.5px] text-textmuted mt-1">Boosted listings from verified sellers and dealers.</p>
        </div>
        <a href="/vehicles" className="text-sm font-semibold text-accent hover:underline">View All →</a>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {featured.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} variant="featured" />
        ))}
      </div>
    </section>
  )
}

export default FeaturedBikes
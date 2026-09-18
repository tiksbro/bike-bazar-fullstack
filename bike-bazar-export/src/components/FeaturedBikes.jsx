import { useState, useEffect } from 'react'
import VehicleCard from './VehicleCard'
import { getFeatured } from '../services/vehicleService'

function FeaturedBikes() {
  // Two pieces of memory: the vehicles themselves (start empty, since
  // we don't have them yet), and whether we're still waiting on them.
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)

  // useEffect runs code that reaches OUTSIDE this component — here,
  // to the network. The empty array [] at the end is the important
  // part: it means "run this once, right after this component first
  // appears on screen" — NOT on every re-render.
  useEffect(() => {
    async function loadFeatured() {
      const data = await getFeatured()
      setFeatured(data)
      setLoading(false)
    }
    loadFeatured()
  }, [])

  if (loading) {
    return <p className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-textmuted">Loading featured bikes...</p>
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
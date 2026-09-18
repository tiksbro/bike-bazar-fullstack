import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVehicleBySlug } from '../services/vehicleService'

const initialListings = [
  { slug: 'yamaha-r15-v3-2022', views: 432, messages: 12, favorites: 18, status: 'active' },
  { slug: 'yamaha-fzs-v3-2021', views: 210, messages: 5, favorites: 7, status: 'active' },
  { slug: 'yamaha-fascino-2023', views: 98, messages: 2, favorites: 3, status: 'paused' },
]

function Dashboard() {
  const [listings, setListings] = useState(initialListings)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      const results = await Promise.all(listings.map((l) => getVehicleBySlug(l.slug)))
      setVehicles(results.filter(Boolean))
      setLoading(false)
    }
    loadVehicles()
  }, [listings])

  function updateStatus(slug, newStatus) {
    setListings(
      listings.map((l) => (l.slug === slug ? { ...l, status: newStatus } : l))
    )
  }

  const activeCount = listings.filter((l) => l.status === 'active').length
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
  const totalFavorites = listings.reduce((sum, l) => sum + l.favorites, 0)
  const totalMessages = listings.reduce((sum, l) => sum + l.messages, 0)

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-textmuted">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Seller Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Active Listings" value={activeCount} />
        <StatCard label="Total Views" value={totalViews.toLocaleString()} />
        <StatCard label="Favorites" value={totalFavorites} />
        <StatCard label="Messages" value={totalMessages} />
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Your Listings</h2>
        <div className="flex flex-col gap-3 mt-4">
          {listings.map((listing) => {
            const vehicle = vehicles.find((v) => v.slug === listing.slug)
            if (!vehicle) return null

            return (
              <div
                key={listing.slug}
                className="border border-bordercol rounded-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-display font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-textmuted">Rs. {vehicle.price.toLocaleString('en-IN')}</p>
                  <StatusBadge status={listing.status} />
                </div>

                <div className="flex gap-4 text-sm text-textmuted">
                  <span>{listing.views} views</span>
                  <span>{listing.messages} messages</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    to={`/vehicle/${vehicle.slug}`}
                    className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                  >
                    View
                  </Link>
                  {listing.status !== 'sold' && (
                    <button
                      onClick={() =>
                        updateStatus(listing.slug, listing.status === 'active' ? 'paused' : 'active')
                      }
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                    >
                      {listing.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                  )}
                  {listing.status !== 'sold' && (
                    <button
                      onClick={() => updateStatus(listing.slug, 'sold')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-ink text-white"
                    >
                      Mark Sold
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const statusStyles = {
  active: { label: 'Active', color: 'text-success', bg: 'bg-successbg' },
  paused: { label: 'Paused', color: 'text-warning', bg: 'bg-warningbg' },
  sold: { label: 'Sold', color: 'text-neutralbadge', bg: 'bg-neutralbadgebg' },
}

function StatusBadge({ status }) {
  const s = statusStyles[status]
  return (
    <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-badge ${s.color} ${s.bg}`}>
      {s.label}
    </span>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border border-bordercol rounded-card p-4">
      <p className="text-xs text-textfaint">{label}</p>
      <p className="font-display font-bold text-2xl mt-1">{value}</p>
    </div>
  )
}

export default Dashboard
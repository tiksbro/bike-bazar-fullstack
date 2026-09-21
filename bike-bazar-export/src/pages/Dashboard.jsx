import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

const statusStyles = {
  active: { label: 'Active', color: 'text-success', bg: 'bg-successbg' },
  paused: { label: 'Paused', color: 'text-warning', bg: 'bg-warningbg' },
  sold: { label: 'Sold', color: 'text-neutralbadge', bg: 'bg-neutralbadgebg' },
}

function Dashboard() {
  useDocumentTitle('Seller Dashboard')
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  useEffect(() => {
    async function loadListings() {
      if (!user) {
        setLoading(false)
        return
      }
      setLoading(true)
      const res = await fetch(`${API_URL}/vehicles/mine/list`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const data = await res.json()
        setListings(data)
      }
      setLoading(false)
    }
    loadListings()
  }, [user])

  async function updateStatus(vehicleId, newStatus) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      const updated = await res.json()
      setListings(listings.map((l) => (l.id === vehicleId ? updated : l)))
    }
  }

  async function boostListing(vehicleId, days) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}/boost`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ days }),
    })
    if (res.ok) {
      const updated = await res.json()
      setListings(listings.map((l) => (l.id === vehicleId ? updated : l)))
    }
  }

  async function deleteListing(vehicleId) {
    const res = await fetch(`${API_URL}/vehicles/${vehicleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.ok) {
      setListings(listings.filter((l) => l.id !== vehicleId))
    }
  }

  if (!user) {
    return (
      <div className="max-w-[500px] mx-auto px-4 sm:px-6 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Log In to View Your Dashboard</h1>
        <Link to="/login" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Log In
        </Link>
      </div>
    )
  }

  const totalCount = listings.length
  const activeCount = listings.filter((l) => l.status === 'active' || !l.status).length
  const pausedCount = listings.filter((l) => l.status === 'paused').length
  const soldCount = listings.filter((l) => l.status === 'sold').length

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Seller Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Total Listings" value={totalCount} />
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Paused" value={pausedCount} />
        <StatCard label="Sold" value={soldCount} />
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Your Listings</h2>
        {loading ? (
          <p className="text-textmuted text-sm mt-4">Loading your listings...</p>
        ) : listings.length === 0 ? (
          <div className="mt-6 text-center border border-bordercol rounded-card p-10">
            <p className="text-textmuted">You haven't listed any vehicles yet.</p>
            <Link to="/sell" className="inline-flex mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
              Sell Your Vehicle
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-4">
            {listings.map((vehicle) => {
              const status = vehicle.status || 'active'
              const s = statusStyles[status]
              return (
                <div
                  key={vehicle.id}
                  className="border border-bordercol rounded-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1">
                    <p className="font-display font-semibold">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-textmuted">Rs. {vehicle.price.toLocaleString('en-IN')}</p>
                    <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-badge ${s.color} ${s.bg}`}>
                      {s.label}
                    </span>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Link
                      to={`/vehicle/${vehicle.slug}`}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                    >
                      View
                    </Link>
                    {status !== 'sold' && (
                      <button
                        onClick={() => updateStatus(vehicle.id, status === 'active' ? 'paused' : 'active')}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                      >
                        {status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    )}
                    {status !== 'sold' && (
                      <button
                        onClick={() => updateStatus(vehicle.id, 'sold')}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-ink text-white"
                      >
                        Mark Sold
                      </button>
                    )}
                    {status !== 'sold' && !vehicle.featured && (
                      <button
                        onClick={() => boostListing(vehicle.id, 7)}
                        className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-accent text-white"
                      >
                        Boost (7 days)
                      </button>
                    )}
                    {vehicle.featured && (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-badge text-featured bg-featuredbg">
                        ⭐ Featured
                      </span>
                    )}
                    <button
                      onClick={() => deleteListing(vehicle.id)}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-danger text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
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
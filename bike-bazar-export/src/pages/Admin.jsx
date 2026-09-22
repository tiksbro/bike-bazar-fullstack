import { useState, useEffect } from 'react'
import { getVehicleBySlug } from '../services/vehicleService'

const initialPending = [
  { slug: 'honda-cb-shine-2019', status: 'pending' },
  { slug: 'bajaj-pulsar-150-2018', status: 'pending' },
  { slug: 'ktm-rc-200-2019', status: 'pending' },
]

function Admin() {
  const [pending, setPending] = useState(initialPending)
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.all(pending.map((p) => getVehicleBySlug(p.slug)))
        setVehicles(results.filter(Boolean))
      } catch {
        setError("Couldn't load listing moderation data. Check your connection and try again.")
      } finally {
        setLoading(false)
      }
    }
    loadVehicles()
  }, [pending, retryCount])

  function updateStatus(slug, newStatus) {
    setPending(pending.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p)))
  }

  const pendingCount = pending.filter((p) => p.status === 'pending').length

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-textmuted">Loading admin dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <p className="text-sm text-danger bg-dangerbg rounded-ctl px-3 py-2 inline-block">{error}</p>
        <div>
          <button
            onClick={() => setRetryCount((c) => c + 1)}
            className="inline-flex mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard label="Users" value="12,450" />
        <StatCard label="Active Listings" value="4,820" />
        <StatCard label="Dealers" value="156" />
        <StatCard label="Pending Approvals" value={pendingCount} />
      </div>

      <div className="mt-10">
        <h2 className="font-display font-bold text-xl">Listing Moderation</h2>
        <div className="flex flex-col gap-3 mt-4">
          {pending.map((p) => {
            const vehicle = vehicles.find((v) => v.slug === p.slug)
            if (!vehicle) return null

            return (
              <div
                key={p.slug}
                className="border border-bordercol rounded-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              >
                <div className="flex-1">
                  <p className="font-display font-semibold">
                    {vehicle.brand} {vehicle.model}
                  </p>
                  <p className="text-sm text-textmuted">
                    Rs. {vehicle.price.toLocaleString('en-IN')} · {vehicle.location}
                  </p>
                </div>

                {p.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(p.slug, 'approved')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn bg-success text-white"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(p.slug, 'rejected')}
                      className="text-sm font-semibold px-3 py-1.5 rounded-btn border border-bordercol"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-badge ${
                      p.status === 'approved' ? 'text-success bg-successbg' : 'text-danger bg-dangerbg'
                    }`}
                  >
                    {p.status === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
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

export default Admin
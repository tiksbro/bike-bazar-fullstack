import { useState, useEffect } from 'react'
import { listVehicles } from '../services/vehicleService'

function Services() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    async function loadVehicles() {
      const data = await listVehicles()
      setVehicles(data)
      setLoading(false)
    }
    loadVehicles()
  }, [])

  function handleRequestInspection(e) {
    e.preventDefault()
    if (!selectedVehicleId) return
    setRequested(true)
  }

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-display font-bold text-[26px]">Vehicle Services</h1>
      <p className="text-textmuted mt-1">
        These services are rolling out gradually. This page shows what's coming and lets you register interest.
      </p>

      <div className="border border-bordercol rounded-card p-6 mt-8">
        <h2 className="font-display font-bold text-xl">Professional Vehicle Inspection</h2>
        <p className="text-textmuted text-sm mt-1">
          Request a partner mechanic to check the engine, brakes, tyres and suspension before you buy.
        </p>

        {requested ? (
          <p className="text-success font-semibold text-sm mt-4">
            ✓ Inspection requested! We'll be in touch once inspection partners are live in your area.
          </p>
        ) : (
          <form onSubmit={handleRequestInspection} className="flex flex-col sm:flex-row gap-3 mt-4">
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              disabled={loading}
              className="flex-1 border border-bordercol rounded-ctl px-3 py-2 text-sm"
            >
              <option value="">{loading ? 'Loading vehicles...' : 'Select a vehicle'}</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.brand} {v.model} — {v.location}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!selectedVehicleId}
              className="bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-2 disabled:opacity-40"
            >
              Request Inspection
            </button>
          </form>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-5 mt-6">
        <ServiceCard
          title="Vehicle Financing"
          body="Compare loan options from partner banks once financing partnerships go live."
          cta="Explore Financing"
        />
        <ServiceCard
          title="Vehicle Insurance"
          body="Get insurance quotes from partner providers once integrations go live."
          cta="Get Insurance"
        />
      </div>
    </div>
  )
}

function ServiceCard({ title, body, cta }) {
  return (
    <div className="border border-bordercol rounded-card p-6">
      <h2 className="font-display font-bold text-lg">{title}</h2>
      <p className="text-textmuted text-sm mt-1">{body}</p>
      <button
        disabled
        className="mt-4 text-sm font-semibold px-4 py-2 rounded-btn border border-bordercol opacity-50 cursor-not-allowed"
      >
        {cta} — Coming Soon
      </button>
    </div>
  )
}

export default Services
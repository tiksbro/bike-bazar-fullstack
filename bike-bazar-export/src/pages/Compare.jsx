import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCompare } from '../context/CompareContext'
import { getByIds } from '../services/vehicleService'

const rows = [
  { label: 'Price', get: (v) => `Rs. ${v.price.toLocaleString('en-IN')}` },
  { label: 'Year', get: (v) => v.year },
  { label: 'KM Driven', get: (v) => v.mileageKm.toLocaleString() },
  { label: 'Engine', get: (v) => (v.engineCc ? `${v.engineCc}cc` : '—') },
  { label: 'Fuel Type', get: (v) => v.fuelType },
  { label: 'Location', get: (v) => v.location },
]

function Compare() {
  const { compareIds, clearCompare } = useCompare()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadVehicles() {
      setLoading(true)
      const data = await getByIds(compareIds)
      setVehicles(data)
      setLoading(false)
    }
    loadVehicles()
  }, [compareIds])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <p className="text-textmuted">Loading comparison...</p>
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display font-bold text-2xl">Nothing to Compare</h1>
        <p className="text-textmuted mt-2">Tick "Compare" on a few vehicles first.</p>
        <Link to="/vehicles" className="inline-flex mt-6 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
          Browse Vehicles
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-[26px]">Compare Vehicles</h1>
        <button onClick={clearCompare} className="text-sm text-accent font-semibold hover:underline">
          Clear all
        </button>
      </div>

      <div className="overflow-x-auto mt-6">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left text-xs text-textfaint p-3 w-32"></th>
              {vehicles.map((v) => (
                <th key={v.id} className="text-left p-3 border-b border-bordercol font-display font-semibold">
                  {v.brand} {v.model}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="text-xs font-semibold text-textfaint p-3 border-b border-bordersoft">{row.label}</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 border-b border-bordersoft text-sm">{row.get(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Compare
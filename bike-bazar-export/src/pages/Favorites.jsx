import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import { getByIds } from '../services/vehicleService'
import VehicleCard from '../components/VehicleCard'

function Favorites() {
  const { favoriteIds } = useFavorites()
  const [favoriteVehicles, setFavoriteVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadFavorites() {
      setLoading(true)
      const data = await getByIds(favoriteIds)
      setFavoriteVehicles(data)
      setLoading(false)
    }
    loadFavorites()
  }, [favoriteIds])

  if (loading) {
    return (
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-textmuted">Loading favorites...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Your Favorites</h1>

      {favoriteVehicles.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-textmuted">You haven't saved any vehicles yet.</p>
          <Link to="/vehicles" className="inline-flex mt-4 bg-accent hover:bg-accenthover transition text-white font-semibold text-sm rounded-btn px-5 py-3">
            Browse Vehicles
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {favoriteVehicles.map((v) => (
            <VehicleCard key={v.id} vehicle={v} variant="result" />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
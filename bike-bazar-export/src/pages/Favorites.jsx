import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useFavorites } from '../context/FavoritesContext'
import { getByIds } from '../services/vehicleService'
import VehicleCard from '../components/VehicleCard'
import EmptyState from '../components/EmptyState'
import { VehicleGridSkeleton } from '../components/Skeleton'

// A heart icon for the empty boxes, so they match what this page is about.
function HeartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  )
}

function Favorites() {
  const { user } = useAuth()
  const { favoriteIds } = useFavorites()
  const [favoriteVehicles, setFavoriteVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // If favoriteIds changes while an older request is still running, the
    // older answer could arrive LAST and overwrite the newer one. The
    // cleanup function below sets ignore = true for the old request, so
    // only the newest answer is ever saved.
    let ignore = false
    async function loadFavorites() {
      setLoading(true)
      setError('')
      try {
        const data = await getByIds(favoriteIds)
        if (!ignore) setFavoriteVehicles(data)
      } catch {
        if (!ignore) setError("Couldn't load favorites. Check your connection and try again.")
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    loadFavorites()
    return () => {
      ignore = true
    }
  }, [favoriteIds, retryCount])

  // When you un-heart a bike on this page, favoriteIds changes at once.
  // Filtering here makes that card disappear straight away, instead of
  // waiting for the reload above to finish.
  const shownVehicles = favoriteVehicles.filter((v) => favoriteIds.includes(v.id))

  // Grey cards only on the FIRST load (nothing on screen yet). When a bike
  // is removed later, the other cards stay put instead of flashing grey.
  const showSkeleton = loading && favoriteVehicles.length === 0

  // One place decides what goes under the heading.
  let content
  if (!user) {
    content = (
      <EmptyState
        icon={<HeartIcon />}
        title="Log in to see your favorites"
        message="Tap the heart on any bike to save it here, so you can find it again later."
        actionLabel="Log in"
        actionTo="/login"
      />
    )
  } else if (showSkeleton) {
    content = <VehicleGridSkeleton count={3} />
  } else if (error) {
    content = (
      <EmptyState
        title="Couldn't load your favorites"
        message="Check your connection and try again."
        actionLabel="Try Again"
        onAction={() => setRetryCount((c) => c + 1)}
      />
    )
  } else if (shownVehicles.length === 0) {
    content = (
      <EmptyState
        icon={<HeartIcon />}
        title="No favorites yet"
        message="Tap the heart on any bike to save it here, so you can find it again later."
        actionLabel="Browse Vehicles"
        actionTo="/vehicles"
      />
    )
  } else {
    content = (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {shownVehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} variant="result" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="font-display font-bold text-[26px]">Your Favorites</h1>
      {user && !showSkeleton && !error && shownVehicles.length > 0 && (
        <p className="text-textmuted text-sm mt-1">
          {shownVehicles.length} saved {shownVehicles.length === 1 ? 'vehicle' : 'vehicles'}
        </p>
      )}
      <div className="mt-6">{content}</div>
    </div>
  )
}

export default Favorites

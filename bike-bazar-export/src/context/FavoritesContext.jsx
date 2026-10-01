import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const FavoritesContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function FavoritesProvider({ children }) {
 
  const { user } = useAuth()
  // ToastProvider wraps FavoritesProvider in App.jsx, so we can show toasts from here.
  const { showToast } = useToast()
  const [favoriteIds, setFavoriteIds] = useState([])

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  // Whenever `user` changes — logging in, logging out, or the app
  // first loading — refresh favorites from the server. No user means
  // no favorites to show, since they belong to an account now.
  useEffect(() => {
    async function loadFavorites() {
      if (!user) {
        setFavoriteIds([])
        return
      }
      const res = await fetch(`${API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const vehicles = await res.json()
        setFavoriteIds(vehicles.map((v) => v.id))
      }
    }
    loadFavorites()
  }, [user])

  async function toggleFavorite(vehicleId) {
    // Not logged in? Favorites belong to an account, so tell the person
    // why nothing happened and give them a quick way to log in.
    if (!user) {
      showToast('Log in to save favorites', { tone: 'info', action: { label: 'Log in', to: '/login' } })
      return
    }

    const alreadyFavorited = favoriteIds.includes(vehicleId)
    const headers = { Authorization: `Bearer ${getToken()}` }

    try {
      if (alreadyFavorited) {
        const res = await fetch(`${API_URL}/favorites/${vehicleId}`, { method: 'DELETE', headers })
        if (!res.ok) throw new Error('remove failed')
        setFavoriteIds(favoriteIds.filter((id) => id !== vehicleId))
        showToast('Removed from favorites', { tone: 'info' })
      } else {
        const res = await fetch(`${API_URL}/favorites/${vehicleId}`, { method: 'POST', headers })
        if (!res.ok) throw new Error('add failed')
        setFavoriteIds([...favoriteIds, vehicleId])
        showToast('Added to favorites', { action: { label: 'View', to: '/favorites' } })
      }
    } catch {
      showToast("Couldn't update favorites. Please try again.", { tone: 'error' })
    }
  }

  function isFavorite(vehicleId) {
    return favoriteIds.includes(vehicleId)
  }

  return (
    <FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}
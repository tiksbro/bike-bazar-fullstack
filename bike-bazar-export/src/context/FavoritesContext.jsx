import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const FavoritesContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function FavoritesProvider({ children }) {
  // Reading useAuth() here works because AuthProvider already wraps
  // FavoritesProvider in App.jsx — a Context can only be read by
  // components nested INSIDE its Provider.
  const { user } = useAuth()
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
    // Not logged in? Nothing to attach a favorite to — quietly do
    // nothing. (A nicer version could redirect to /login instead; that's
    // a reasonable next polish step, not something we're building now.)
    if (!user) return

    const alreadyFavorited = favoriteIds.includes(vehicleId)
    const headers = { Authorization: `Bearer ${getToken()}` }

    if (alreadyFavorited) {
      await fetch(`${API_URL}/favorites/${vehicleId}`, { method: 'DELETE', headers })
      setFavoriteIds(favoriteIds.filter((id) => id !== vehicleId))
    } else {
      await fetch(`${API_URL}/favorites/${vehicleId}`, { method: 'POST', headers })
      setFavoriteIds([...favoriteIds, vehicleId])
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
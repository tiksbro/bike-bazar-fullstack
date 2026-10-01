import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const CompareContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function CompareProvider({ children }) {
  const { user } = useAuth()
  // ToastProvider wraps CompareProvider in App.jsx, so we can show toasts from here.
  const { showToast } = useToast()
  const [compareIds, setCompareIds] = useState([])
  // Carries the backend's exact rejection message (e.g. the "up to 4"
  // limit) back out to whichever component wants to show it.
  const [compareError, setCompareError] = useState('')

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  useEffect(() => {
    async function loadCompare() {
      if (!user) {
        setCompareIds([])
        return
      }
      const res = await fetch(`${API_URL}/compare`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const vehicles = await res.json()
        setCompareIds(vehicles.map((v) => v.id))
      }
    }
    loadCompare()
  }, [user])

  async function toggleCompare(vehicleId) {
    // Not logged in? The compare list belongs to an account, so say so
    // (before, the button just did nothing) and offer a quick way to log in.
    if (!user) {
      showToast('Log in to compare bikes', { tone: 'info', action: { label: 'Log in', to: '/login' } })
      return
    }
    setCompareError('')

    const headers = { Authorization: `Bearer ${getToken()}` }
    const alreadyComparing = compareIds.includes(vehicleId)

    try {
      if (alreadyComparing) {
        const res = await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'DELETE', headers })
        if (!res.ok) throw new Error('remove failed')
        setCompareIds(compareIds.filter((id) => id !== vehicleId))
        showToast('Removed from compare', { tone: 'info' })
      } else {
        const res = await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'POST', headers })
        if (!res.ok) {
          // The 4-vehicle limit lives on the SERVER now, not just a local
          // MAX_COMPARE constant — this is what surfaces that rejection.
          // It shows both under the Compare bar and as a red toast.
          const data = await res.json()
          const message = data.error || 'Could not add to compare'
          setCompareError(message)
          showToast(message, { tone: 'error' })
          return
        }
        const newCount = compareIds.length + 1
        setCompareIds([...compareIds, vehicleId])
        showToast(`Added to compare (${newCount} of 4)`, { action: { label: 'Compare', to: '/compare' } })
      }
    } catch {
      showToast("Couldn't update compare. Please try again.", { tone: 'error' })
    }
  }

  function isComparing(vehicleId) {
    return compareIds.includes(vehicleId)
  }

  async function clearCompare() {
    if (!user) return
    const headers = { Authorization: `Bearer ${getToken()}` }
    await Promise.all(compareIds.map((id) => fetch(`${API_URL}/compare/${id}`, { method: 'DELETE', headers })))
    setCompareIds([])
  }

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, isComparing, clearCompare, compareError }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
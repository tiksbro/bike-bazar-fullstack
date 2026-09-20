import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const CompareContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export function CompareProvider({ children }) {
  const { user } = useAuth()
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
    if (!user) return
    setCompareError('')

    const headers = { Authorization: `Bearer ${getToken()}` }
    const alreadyComparing = compareIds.includes(vehicleId)

    if (alreadyComparing) {
      await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'DELETE', headers })
      setCompareIds(compareIds.filter((id) => id !== vehicleId))
    } else {
      const res = await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'POST', headers })
      if (!res.ok) {
        // The 4-vehicle limit lives on the SERVER now, not just a local
        // MAX_COMPARE constant — this is what surfaces that rejection.
        const data = await res.json()
        setCompareError(data.error || 'Could not add to compare')
        return
      }
      setCompareIds([...compareIds, vehicleId])
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
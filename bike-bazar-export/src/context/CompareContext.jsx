import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

const CompareContext = createContext()
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'
const MAX_COMPARE = 4

// Old listings have no vehicleType, so anything that is not 'car' is a bike.
function kindOf(vehicle) {
  return vehicle.vehicleType === 'car' ? 'car' : 'bike'
}

export function CompareProvider({ children }) {
  const { user } = useAuth()
  // ToastProvider wraps CompareProvider in App.jsx, so we can show toasts from here.
  const { showToast } = useToast()
  // Each item remembers its id AND its kind ('bike' or 'car'), so we can
  // stop a car joining a list of bikes without asking the server first.
  // Example: [{ id: '65f...', kind: 'bike' }, { id: '65a...', kind: 'bike' }]
  const [compareItems, setCompareItems] = useState([])
  // Carries the backend's exact rejection message (e.g. the "up to 4"
  // limit) back out to whichever component wants to show it.
  const [compareError, setCompareError] = useState('')

  // Just the ids. CompareBar and the Compare page only need these.
  // useMemo keeps the SAME array until compareItems really changes. Without
  // it, every render would make a "new" list, and the Compare page (which
  // reloads whenever compareIds changes) would reload forever.
  const compareIds = useMemo(() => compareItems.map((item) => item.id), [compareItems])

  function getToken() {
    return localStorage.getItem('bikebazar_token')
  }

  useEffect(() => {
    async function loadCompare() {
      if (!user) {
        setCompareItems([])
        return
      }
      const res = await fetch(`${API_URL}/compare`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      })
      if (res.ok) {
        const vehicles = await res.json()
        setCompareItems(vehicles.map((v) => ({ id: v.id, kind: kindOf(v) })))
      }
    }
    loadCompare()
  }, [user])

  // Shown when someone tries to mix bikes and cars. The button takes them
  // to the Compare page, where "Clear all" empties the list.
  function showMixError(message) {
    setCompareError(message)
    showToast(message, { tone: 'error', action: { label: 'Open Compare', to: '/compare' } })
  }

  // Takes the whole vehicle (not just its id), because we need to know
  // if it's a bike or a car.
  async function toggleCompare(vehicle) {
    // Not logged in? The compare list belongs to an account, so say so
    // and offer a quick way to log in.
    if (!user) {
      showToast('Log in to compare vehicles', { tone: 'info', action: { label: 'Log in', to: '/login' } })
      return
    }
    setCompareError('')

    const headers = { Authorization: `Bearer ${getToken()}` }
    const vehicleId = vehicle.id
    const kind = kindOf(vehicle)
    const alreadyComparing = compareIds.includes(vehicleId)

    // Bikes with bikes, cars with cars. We check here first so the message
    // shows at once. The server checks again too (routes/compare.js), in
    // case this list is out of date.
    if (!alreadyComparing) {
      const differentItem = compareItems.find((item) => item.kind !== kind)
      if (differentItem) {
        const listedLabel = differentItem.kind === 'car' ? 'Cars' : 'Bikes'
        showMixError(
          `Your compare list has ${differentItem.kind}s. ${listedLabel} can only be compared with ${differentItem.kind}s, so clear the list first to compare ${kind}s.`
        )
        return
      }
    }

    try {
      if (alreadyComparing) {
        const res = await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'DELETE', headers })
        if (!res.ok) throw new Error('remove failed')
        setCompareItems(compareItems.filter((item) => item.id !== vehicleId))
        showToast('Removed from compare', { tone: 'info' })
      } else {
        const res = await fetch(`${API_URL}/compare/${vehicleId}`, { method: 'POST', headers })
        if (!res.ok) {
          // The server said no: the 4-vehicle limit, or a bike/car mix.
          // It shows both under the Compare bar and as a red toast.
          const data = await res.json()
          const message = data.error || 'Could not add to compare'
          if (data.code === 'COMPARE_TYPE_MISMATCH') {
            showMixError(message)
          } else {
            setCompareError(message)
            showToast(message, { tone: 'error' })
          }
          return
        }
        const newCount = compareItems.length + 1
        setCompareItems([...compareItems, { id: vehicleId, kind }])
        showToast(`Added to compare (${newCount} of ${MAX_COMPARE})`, { action: { label: 'Compare', to: '/compare' } })
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
    setCompareItems([])
    setCompareError('')
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

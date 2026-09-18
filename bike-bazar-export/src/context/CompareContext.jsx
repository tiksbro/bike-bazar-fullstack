import { createContext, useContext, useState } from 'react'

const CompareContext = createContext()
const MAX_COMPARE = 4

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([])

  function toggleCompare(id) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((cId) => cId !== id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, id]
    })
  }

  function isComparing(id) {
    return compareIds.includes(id)
  }

  function clearCompare() {
    setCompareIds([])
  }

  return (
    <CompareContext.Provider value={{ compareIds, toggleCompare, isComparing, clearCompare }}>
      {children}
    </CompareContext.Provider>
  )
}

export function useCompare() {
  return useContext(CompareContext)
}
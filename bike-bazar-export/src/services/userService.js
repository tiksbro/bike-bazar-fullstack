const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function getUserContact(id) {
  const res = await fetch(`${API_URL}/users/${id}/contact`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Failed to fetch user contact info')
  return res.json()
}
export async function getUserRatings(userId) {
  const res = await fetch(`${API_URL}/users/${userId}/ratings`)
  if (!res.ok) return { ratings: [], averageStars: null, totalCount: 0 }
  return res.json()
}
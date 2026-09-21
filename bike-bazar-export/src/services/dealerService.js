const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function listDealers() {
  const res = await fetch(`${API_URL}/dealers`)
  if (!res.ok) throw new Error('Failed to fetch dealers')
  return res.json()
}

export async function getDealerById(id) {
  const res = await fetch(`${API_URL}/dealers/${id}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Failed to fetch dealer')
  return res.json()
}
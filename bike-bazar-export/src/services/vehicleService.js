const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

async function fetchAllVehicles() {
  const res = await fetch(`${API_URL}/vehicles`)
  if (!res.ok) throw new Error('Failed to fetch vehicles')
  return res.json()
}

export async function getFeatured() {
  const all = await fetchAllVehicles()
  return all.filter((v) => v.featured)
}

export async function listVehicles(filters = {}) {
  
  const params = new URLSearchParams()
  if (filters.q) params.set('q', filters.q)
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.type) params.set('type', filters.type)
  if (filters.location) params.set('location', filters.location)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)

  const res = await fetch(`${API_URL}/vehicles?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch vehicles')
  return res.json()
}

export async function createVehicle(vehicleData,token) {
  const res = await fetch(`${API_URL}/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(vehicleData),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create vehicle')
  }
  return data
}

// Sends the chosen photo files to our backend, which puts them on Cloudinary.
// Returns a list like [{ url, publicId }, ...] that we then save with the listing.
export async function uploadPhotos(files, token) {
  // FormData is how browsers send files. We don't set 'Content-Type' ourselves:
  // the browser adds the right one (multipart/form-data) automatically.
  const formData = new FormData()
  files.forEach((file) => formData.append('photos', file))

  const res = await fetch(`${API_URL}/uploads`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || 'Failed to upload photos')
  }
  return data.photos
}

export async function getVehicleBySlug(slug) {
  const res = await fetch(`${API_URL}/vehicles/${slug}`)
  if (res.status === 404) return undefined
  if (!res.ok) throw new Error('Failed to fetch vehicle')
  return res.json()
}

export async function getByIds(ids) {
  const all = await fetchAllVehicles()
  return all.filter((v) => ids.includes(v.id))
}

export async function getSimilar(vehicle, limit = 3) {
  const all = await fetchAllVehicles()
  return all
    .filter((v) => v.id !== vehicle.id && (v.brand === vehicle.brand || v.type === vehicle.type))
    .slice(0, limit)
}

export function getHealthScore(vehicle) {
  const age = new Date().getFullYear() - vehicle.year
  const kmFactor = Math.max(0, 100 - vehicle.mileageKm / 500)
  const ageFactor = Math.max(0, 100 - age * 6)
  const overall = Math.round((kmFactor + ageFactor) / 2)
  const clamped = Math.min(98, Math.max(35, overall))

  return {
    overall: clamped,
    engine: Math.min(98, clamped + 5),
    brakes: Math.min(95, clamped),
    tyres: Math.max(30, clamped - 15),
    electrical: Math.min(97, clamped + 8),
    documents: 95,
  }
}
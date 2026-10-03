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

// Bikes are the default. Pass { vehicle: 'car' } for cars, or { vehicle: 'all' } for both.
// (Phase 5 will add the Bikes / Cars tabs on Browse that set `vehicle`.)
export async function listVehicles(filters = {}) {
  const params = new URLSearchParams()
  const vehicle = filters.vehicle || 'bike'
  if (vehicle !== 'all') params.set('vehicle', vehicle)
  if (filters.q) params.set('q', filters.q)
  if (filters.brand) params.set('brand', filters.brand)
  if (filters.type) params.set('type', filters.type)
  if (filters.location) params.set('location', filters.location)
  if (filters.fuelType) params.set('fuelType', filters.fuelType)
  // transmission and seats are car-only filters
  if (filters.transmission) params.set('transmission', filters.transmission)
  if (filters.seats) params.set('seats', filters.seats)
  if (filters.minPrice) params.set('minPrice', filters.minPrice)
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice)
  if (filters.sortBy) params.set('sortBy', filters.sortBy)

  const res = await fetch(`${API_URL}/vehicles?${params.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch vehicles')
  return res.json()
}

// The brand list for one tab, A to Z, e.g. ['Bajaj', 'Honda', ...] for bikes.
export async function getBrands(vehicle = 'bike') {
  const res = await fetch(`${API_URL}/vehicles/brands?vehicle=${vehicle}`)
  if (!res.ok) throw new Error('Failed to fetch brands')
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
  // A listing with no vehicleType counts as a bike
  const sameKind = (v) => (v.vehicleType || 'bike') === (vehicle.vehicleType || 'bike')
  // "Similar" means the same kind (bike or car) AND the same brand or type
  return all
    .filter((v) => v.id !== vehicle.id && sameKind(v) && (v.brand === vehicle.brand || v.type === vehicle.type))
    .slice(0, limit)
}

// ---- Health Score ----
// A rough "condition estimate" made only from the listing details (no mechanic
// has looked at the vehicle). Bikes and cars wear out at very different speeds,
// so each has its own formula. Both return the same shape:
//   { overall: 72, parts: [{ label: 'Engine', score: 77 }, ...] }
// VehicleDetail and Compare just show whatever parts come back.

// Keeps a part score between a floor and a ceiling (never 0, never a perfect 100).
function clampScore(score, min = 30, max = 98) {
  return Math.round(Math.min(max, Math.max(min, score)))
}

function getBikeHealthScore(vehicle, age) {
  // A bike loses 1 point per 500 km (25,000 km -> 50) and 6 points per year.
  const kmFactor = Math.max(0, 100 - vehicle.mileageKm / 500)
  const ageFactor = Math.max(0, 100 - age * 6)
  const overall = clampScore((kmFactor + ageFactor) / 2, 35)

  return {
    overall,
    parts: [
      { label: 'Engine', score: Math.min(98, overall + 5) },
      { label: 'Brakes', score: Math.min(95, overall) },
      { label: 'Tyres', score: Math.max(30, overall - 15) },
      { label: 'Electrical', score: Math.min(97, overall + 8) },
      { label: 'Documents', score: 95 },
    ],
  }
}

function getCarHealthScore(vehicle, age) {
  const km = vehicle.mileageKm
  const isElectric = vehicle.fuelType === 'Electric'
  // Hybrids and electric cars slow down using the motor ("regenerative
  // braking"), so their brake pads wear out more slowly.
  const hasRegenBraking = isElectric || vehicle.fuelType === 'Hybrid'

  // A car is built to run much longer than a bike: it loses 1 point per
  // 2,000 km (100,000 km -> 50) and 5 points per year (10 years -> 50).
  const kmFactor = Math.max(0, 100 - km / 2000)
  const ageFactor = Math.max(0, 100 - age * 5)
  let base = (kmFactor + ageFactor) / 2

  // Driven a lot every year (more than 15,000 km a year, e.g. a taxi)?
  // Hard use wears everything a bit faster.
  const kmPerYear = km / Math.max(1, age)
  if (kmPerYear > 15000) base -= 5

  const parts = []

  if (isElectric) {
    // No engine or gearbox. The battery slowly holds less charge with
    // every year and every charge.
    parts.push({ label: 'Battery', score: clampScore(100 - age * 4 - km / 4000) })
  } else {
    // Diesel engines are built for long distances, so they get a small bonus.
    const dieselBonus = vehicle.fuelType === 'Diesel' ? 3 : 0
    parts.push({ label: 'Engine', score: clampScore(base + 5 + dieselBonus) })
    // A manual gearbox has a clutch plate that wears out with use.
    const clutchWear = vehicle.transmission === 'manual' ? 3 : 0
    parts.push({ label: 'Gearbox', score: clampScore(base - clutchWear) })
  }

  // 7+ seat cars carry more weight, and 4WD cars are often taken off-road.
  const heavyLoad = vehicle.seats >= 7 ? 5 : 0
  const offRoad = vehicle.driveType === '4WD' ? 5 : 0
  parts.push({ label: 'Suspension', score: clampScore(base - heavyLoad - offRoad) })
  parts.push({ label: 'Brakes', score: clampScore(base + (hasRegenBraking ? 5 : 0)) })
  parts.push({ label: 'Tyres', score: clampScore(base - 15) })
  parts.push({ label: 'Electrical', score: clampScore(base + 5) })

  // The overall score is the average of the condition parts above.
  // Documents is added after, so it doesn't push the overall score up.
  const total = parts.reduce((sum, part) => sum + part.score, 0)
  const overall = clampScore(total / parts.length, 35)
  parts.push({ label: 'Documents', score: 95 })

  return { overall, parts }
}

export function getHealthScore(vehicle) {
  // Never below 0, even if someone typed next year as the model year.
  const age = Math.max(0, new Date().getFullYear() - vehicle.year)
  // Old listings have no vehicleType, so anything that is not 'car' is a bike.
  if (vehicle.vehicleType === 'car') return getCarHealthScore(vehicle, age)
  return getBikeHealthScore(vehicle, age)
}

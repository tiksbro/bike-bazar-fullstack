import { newBikes } from '../data/newBikes'

// Static catalog data with no backend and nothing that changes at
// runtime, so plain synchronous lookups are enough here — no
// fetch/async needed like the other services.
export function listNewBikes() {
  return newBikes
}

export function getNewBikeBySlug(slug) {
  return newBikes.find((bike) => bike.slug === slug)
}

import { newBikes } from '../data/newBikes'
import { newCars } from '../data/newCars'

// Static catalog data with no backend and nothing that changes at
// runtime, so plain synchronous lookups are enough here — no
// fetch/async needed like the other services.
//
// Since Car Plan Phase 7 this file serves the new CARS catalog too.
// The file name stays newBikeService for now (renaming is Phase 8).
export function listNewBikes() {
  return newBikes
}

export function getNewBikeBySlug(slug) {
  return newBikes.find((bike) => bike.slug === slug)
}

export function listNewCars() {
  return newCars
}

// Bikes and cars share one detail route (/new-bikes/:slug), so the
// detail page cannot know which list a slug belongs to. This checks
// the bikes first, then the cars, and gives back whichever matches.
// Slugs are unique across both lists, so the order does not matter.
// Returns undefined when nothing matches, like .find() does.
export function getNewVehicleBySlug(slug) {
  return getNewBikeBySlug(slug) ?? newCars.find((car) => car.slug === slug)
}

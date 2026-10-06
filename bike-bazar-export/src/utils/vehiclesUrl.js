// Builds a link to the Browse page with filters in the web address.
// Example: vehiclesUrl('bike', { brand: 'Honda' }) gives "/vehicles?brand=Honda".
// On the Cars tab it adds vehicle=car first, so Browse opens on Cars.
// Bikes is Browse's default, so bike links don't need it.
// Used by Hero.jsx and QuickFilters.jsx, so both build links the same way.
export function vehiclesUrl(vehicle, params = {}) {
  const searchParams = new URLSearchParams()
  if (vehicle === 'car') searchParams.set('vehicle', 'car')
  Object.entries(params).forEach(([key, value]) => searchParams.set(key, value))
  const qs = searchParams.toString()
  return qs ? `/vehicles?${qs}` : '/vehicles'
}

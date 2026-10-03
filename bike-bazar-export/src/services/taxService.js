import {
  provinces,
  brands,
  taxRates,
  carCcBands,
  carPowerBands,
  carTaxRates,
  carEvTaxRates,
} from '../data/taxRates'

export function getProvinces() {
  return provinces
}

export function getBrands() {
  return brands
}

export function getModelsForBrand(brandName) {
  const brand = brands.find((b) => b.name === brandName)
  return brand ? brand.models : []
}

export function getCcBand(engineCc) {
  if (engineCc <= 125) return 'Upto 125cc'
  if (engineCc <= 160) return '125-160cc'
  if (engineCc <= 250) return '160-250cc'
  if (engineCc <= 400) return '250-400cc'
  return '400cc & Above'
}

export function calculateTax(province, ccBand) {
  return taxRates[province]?.[ccBand] ?? null
}

// ---------------------------------------------------------------------
// CARS (Car Plan Phase 7)
// ---------------------------------------------------------------------
// Petrol / Diesel / Hybrid cars are taxed by engine size (cc).
// Electric cars have no cc, so they are taxed by motor power (kW).

// The engine size groups, for the "Engine size" select.
export function getCarCcBands() {
  return carCcBands
}

// The motor power groups, for the "Motor power" select.
export function getCarPowerBands() {
  return carPowerBands
}

// Turn a cc number (like 1497) into its band (like '1001-1500cc').
export function getCarCcBand(engineCc) {
  if (engineCc <= 1000) return 'Upto 1000cc'
  if (engineCc <= 1500) return '1001-1500cc'
  if (engineCc <= 2000) return '1501-2000cc'
  if (engineCc <= 2500) return '2001-2500cc'
  if (engineCc <= 3000) return '2501-3000cc'
  if (engineCc <= 3500) return '3001-3500cc'
  return 'Above 3500cc'
}

// Turn a kW number (like 45) into its band (like 'Upto 50 kW').
export function getCarPowerBand(kw) {
  if (kw <= 50) return 'Upto 50 kW'
  if (kw <= 125) return '51-125 kW'
  if (kw <= 200) return '126-200 kW'
  return 'Above 200 kW'
}

// Look up the yearly car tax. Electric cars use the kW table,
// everything else uses the cc table. Returns null if not found.
export function calculateCarTax(province, fuelType, band) {
  const table = fuelType === 'Electric' ? carEvTaxRates : carTaxRates
  return table[province]?.[band] ?? null
}

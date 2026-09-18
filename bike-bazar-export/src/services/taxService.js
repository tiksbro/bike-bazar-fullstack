import { provinces, brands, taxRates } from '../data/taxRates'

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

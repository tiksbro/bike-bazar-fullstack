import { dealers } from '../data/dealers'

export function listDealers() {
  return dealers
}

export function getDealerBySlug(slug) {
  return dealers.find((d) => d.slug === slug)
}
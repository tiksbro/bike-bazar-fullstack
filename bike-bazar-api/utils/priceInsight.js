const Vehicle = require('../models/Vehicle')

const MIN_COMPARABLES = 2
const GOOD_THRESHOLD = 0.9
const HIGH_THRESHOLD = 1.1

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function insightFromAverage(price, averagePrice) {
  if (price < averagePrice * GOOD_THRESHOLD) return 'good'
  if (price > averagePrice * HIGH_THRESHOLD) return 'high'
  return 'fair'
}

// Used for a single vehicle (e.g. GET /:slug) — queries the comparable
// listings directly since it's just one extra query for one vehicle.
async function computePriceInsight(vehicle) {
  const comparables = await Vehicle.find({
    _id: { $ne: vehicle._id },
    brand: new RegExp(`^${escapeRegex(vehicle.brand)}$`, 'i'),
    model: new RegExp(`^${escapeRegex(vehicle.model)}$`, 'i'),
  }).select('price')

  if (comparables.length < MIN_COMPARABLES) return 'fair'

  const averagePrice = comparables.reduce((sum, v) => sum + v.price, 0) / comparables.length
  return insightFromAverage(vehicle.price, averagePrice)
}

// Used for a list of vehicles (e.g. GET /) — a single aggregation groups
// EVERY vehicle in the database by brand+model to get each group's total
// price and count in one pass, instead of querying per vehicle (N+1).
async function buildPriceInsightGroups() {
  const groups = await Vehicle.aggregate([
    {
      $group: {
        _id: { brand: { $toLower: '$brand' }, model: { $toLower: '$model' } },
        totalPrice: { $sum: '$price' },
        count: { $sum: 1 },
      },
    },
  ])

  const groupMap = new Map()
  for (const g of groups) {
    groupMap.set(`${g._id.brand}|${g._id.model}`, { totalPrice: g.totalPrice, count: g.count })
  }
  return groupMap
}

// Applies the precomputed groups to one vehicle, excluding the vehicle
// itself from the group's total/count before averaging.
function applyPriceInsight(vehicle, groupMap) {
  const key = `${vehicle.brand.toLowerCase()}|${vehicle.model.toLowerCase()}`
  const group = groupMap.get(key)
  if (!group) return 'fair'

  const otherCount = group.count - 1
  if (otherCount < MIN_COMPARABLES) return 'fair'

  const otherAveragePrice = (group.totalPrice - vehicle.price) / otherCount
  return insightFromAverage(vehicle.price, otherAveragePrice)
}

module.exports = { computePriceInsight, buildPriceInsightGroups, applyPriceInsight }

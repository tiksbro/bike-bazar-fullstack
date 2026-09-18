const express = require('express')
const Vehicle = require('../models/Vehicle')

const router = express.Router()

const ART_COLORS = ['orange', 'blue', 'graphite', 'teal']
const REQUIRED_FIELDS = ['brand', 'model', 'year', 'type', 'mileageKm', 'engineCc', 'price', 'location', 'fuelType']

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueSlug(brand, model, year) {
  const baseSlug = slugify(`${brand} ${model} ${year}`)
  let slug = baseSlug
  let suffix = 2

  while (await Vehicle.findOne({ slug })) {
    slug = `${baseSlug}-${suffix}`
    suffix++
  }

  return slug
}

// GET /api/vehicles
router.get('/', async (req, res) => {
  try {
    const { q, brand, type, location, minPrice, maxPrice, sortBy } = req.query

    const filter = {}

    if (q) {
      const regex = new RegExp(q, 'i')
      filter.$or = [{ brand: regex }, { model: regex }]
    }
    if (brand) filter.brand = brand
    if (type) filter.type = type
    if (location) filter.location = location
    if (minPrice || maxPrice) {
      filter.price = {}
      if (minPrice) filter.price.$gte = Number(minPrice)
      if (maxPrice) filter.price.$lte = Number(maxPrice)
    }

    let sort = { _id: -1 }
    if (sortBy === 'priceLowHigh') sort = { price: 1 }
    else if (sortBy === 'priceHighLow') sort = { price: -1 }
    else if (sortBy === 'lowestKm') sort = { mileageKm: 1 }

    const vehicles = await Vehicle.find(filter).sort(sort)
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message })
  }
})

// GET /api/vehicles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ slug: req.params.slug })
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with slug "${req.params.slug}"` })
    }
    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle', details: err.message })
  }
})

// POST /api/vehicles
router.post('/', async (req, res) => {
  try {
    const { brand, model, year, type, mileageKm, engineCc, price, negotiable, location, fuelType, description } = req.body

    const missing = REQUIRED_FIELDS.filter(
      (field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === ''
    )
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
    }

    const slug = await generateUniqueSlug(brand, model, year)
    const artColor = ART_COLORS[Math.floor(Math.random() * ART_COLORS.length)]

    const vehicle = new Vehicle({
      slug,
      brand,
      model,
      year,
      type,
      mileageKm,
      engineCc,
      price,
      negotiable,
      location,
      fuelType,
      description,
      featured: false,
      verifiedSeller: false,
      priceInsight: 'fair',
      artColor,
    })

    await vehicle.save()
    res.status(201).json(vehicle)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create vehicle', details: err.message })
  }
})

module.exports = router

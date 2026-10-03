const express = require('express')
const Vehicle = require('../models/Vehicle')
const User = require('../models/User')
const requireAuth = require('../middleware/requireAuth')
const { deletePhotosFromCloudinary } = require('./uploads')
const { computePriceInsight, buildPriceInsightGroups, applyPriceInsight } = require('../utils/priceInsight')

const router = express.Router()

const ART_COLORS = ['orange', 'blue', 'graphite', 'teal']
// Every listing needs these. engineCc and the car fields are checked separately in getMissingFields().
const REQUIRED_FIELDS = ['brand', 'model', 'year', 'type', 'mileageKm', 'price', 'location', 'fuelType']
const CAR_REQUIRED_FIELDS = ['transmission', 'seats']
const VEHICLE_TYPES = ['bike', 'car']
const FREE_DEALER_LISTING_LIMIT = 5
const MIN_PHOTOS = 1
const MAX_PHOTOS = 6

// Checks the photos sent with a new listing. Returns a clean list, or null if they are not valid.
// Each photo must be one we uploaded to Cloudinary through POST /api/uploads.
function getValidPhotos(photos) {
  if (!Array.isArray(photos) || photos.length < MIN_PHOTOS || photos.length > MAX_PHOTOS) return null

  const allPhotosValid = photos.every(
    (photo) =>
      photo &&
      typeof photo.url === 'string' &&
      photo.url.startsWith('https://res.cloudinary.com/') &&
      typeof photo.publicId === 'string' &&
      photo.publicId.startsWith('bike-bazar/')
  )
  if (!allPhotosValid) return null

  return photos.map((photo) => ({ url: photo.url, publicId: photo.publicId }))
}

// Makes symbols like ( ) . + in a search box count as normal letters
function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isEmpty(value) {
  return value === undefined || value === null || value === ''
}

// Returns the names of the required fields that are missing for this kind of vehicle.
function getMissingFields(body, vehicleType) {
  const fieldsToCheck = [...REQUIRED_FIELDS]
  // Electric vehicles have no engine, so engineCc is only needed for the others
  if (body.fuelType !== 'Electric') fieldsToCheck.push('engineCc')
  if (vehicleType === 'car') fieldsToCheck.push(...CAR_REQUIRED_FIELDS)

  return fieldsToCheck.filter((field) => isEmpty(body[field]))
}

// Only cars get car fields. For a bike, these come back as undefined, so they are not saved.
function getCarFields(body, vehicleType) {
  if (vehicleType !== 'car') return {}

  const carFields = {
    transmission: body.transmission,
    seats: body.seats,
    driveType: isEmpty(body.driveType) ? undefined : body.driveType,
  }
  // Battery and range only make sense for electric cars
  if (body.fuelType === 'Electric') {
    carFields.batteryKwh = isEmpty(body.batteryKwh) ? undefined : body.batteryKwh
    carFields.rangeKm = isEmpty(body.rangeKm) ? undefined : body.rangeKm
  }
  return carFields
}

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
// Optional filters in the URL, for example:
//   /api/vehicles?vehicle=car&fuelType=Diesel&transmission=automatic&seats=7
// With no `vehicle`, bikes AND cars both come back (Favorites/Compare need that).
router.get('/', async (req, res) => {
  try {
    const { q, vehicle, brand, type, location, fuelType, transmission, seats, minPrice, maxPrice, sortBy } = req.query

    if (vehicle && !VEHICLE_TYPES.includes(vehicle)) {
      return res.status(400).json({ error: `vehicle must be one of: ${VEHICLE_TYPES.join(', ')}` })
    }

    const filter = {}

    if (q) {
      // escapeRegex stops a search like "R15 (V3)" from crashing the regex
      const regex = new RegExp(escapeRegex(q), 'i')
      filter.$or = [{ brand: regex }, { model: regex }]
    }
    if (vehicle) filter.vehicleType = vehicle
    if (brand) filter.brand = brand
    if (type) filter.type = type
    if (location) filter.location = location
    if (fuelType) filter.fuelType = fuelType
    // transmission and seats only exist on cars, so these two only ever match cars
    if (transmission) filter.transmission = transmission
    if (seats) filter.seats = Number(seats)
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

    const groupMap = await buildPriceInsightGroups()
    vehicles.forEach((vehicle) => {
      vehicle.priceInsight = applyPriceInsight(vehicle, groupMap)
    })

    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles', details: err.message })
  }
})

// GET /api/vehicles/brands?vehicle=car
// The brand list for one tab, A to Z, taken from real listings.
// So the Cars tab shows Hyundai, Suzuki... and the Bikes tab shows Yamaha, Bajaj...
router.get('/brands', async (req, res) => {
  try {
    const vehicle = isEmpty(req.query.vehicle) ? 'bike' : req.query.vehicle
    if (!VEHICLE_TYPES.includes(vehicle)) {
      return res.status(400).json({ error: `vehicle must be one of: ${VEHICLE_TYPES.join(', ')}` })
    }

    const brands = await Vehicle.distinct('brand', { vehicleType: vehicle })
    brands.sort((a, b) => a.localeCompare(b))

    res.json(brands)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch brands', details: err.message })
  }
})

// GET /api/vehicles/mine/list
router.get('/mine/list', requireAuth, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.userId }).sort({ _id: -1 })
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch your vehicles', details: err.message })
  }
})

// GET /api/vehicles/stats/categories
// motorcycles, scooters and electric are BIKE counts (the Home page cards already use them).
// cars and electricCars are new, for the Cars side of the site.
router.get('/stats/categories', async (req, res) => {
  try {
    const [motorcycles, scooters, electric, cars, electricCars] = await Promise.all([
      Vehicle.countDocuments({ vehicleType: 'bike', type: 'motorcycle' }),
      Vehicle.countDocuments({ vehicleType: 'bike', type: 'scooter' }),
      Vehicle.countDocuments({ vehicleType: 'bike', fuelType: 'Electric' }),
      Vehicle.countDocuments({ vehicleType: 'car' }),
      Vehicle.countDocuments({ vehicleType: 'car', fuelType: 'Electric' }),
    ])

    res.json({ motorcycles, scooters, electric, cars, electricCars })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch category stats', details: err.message })
  }
})

// GET /api/vehicles/stats/budget-ranges
router.get('/stats/budget-ranges', async (req, res) => {
  try {
    const [under1Lakh, oneToTwoLakh, twoToThreeLakh, threeToFiveLakh, aboveFiveLakh] = await Promise.all([
      Vehicle.countDocuments({ price: { $lt: 100000 } }),
      Vehicle.countDocuments({ price: { $gte: 100000, $lt: 200000 } }),
      Vehicle.countDocuments({ price: { $gte: 200000, $lt: 300000 } }),
      Vehicle.countDocuments({ price: { $gte: 300000, $lt: 500000 } }),
      Vehicle.countDocuments({ price: { $gte: 500000 } }),
    ])

    res.json({ under1Lakh, oneToTwoLakh, twoToThreeLakh, threeToFiveLakh, aboveFiveLakh })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch budget range stats', details: err.message })
  }
})

// GET /api/vehicles/:slug
router.get('/:slug', async (req, res) => {
  try {
    const vehicle = await Vehicle.findOne({ slug: req.params.slug })
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with slug "${req.params.slug}"` })
    }

    vehicle.priceInsight = await computePriceInsight(vehicle)

    res.json(vehicle)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle', details: err.message })
  }
})

// POST /api/vehicles
router.post('/', requireAuth, async (req, res) => {
  try {
    const { brand, model, year, type, mileageKm, engineCc, price, negotiable, location, fuelType, description, photos } = req.body
    // The current Sell form doesn't send vehicleType yet, so a missing one means 'bike'
    const vehicleType = isEmpty(req.body.vehicleType) ? 'bike' : req.body.vehicleType

    if (!VEHICLE_TYPES.includes(vehicleType)) {
      return res.status(400).json({ error: `vehicleType must be one of: ${VEHICLE_TYPES.join(', ')}` })
    }

    const missing = getMissingFields(req.body, vehicleType)
    if (missing.length > 0) {
      return res.status(400).json({ error: `Missing required fields: ${missing.join(', ')}` })
    }

    // A bike must be motorcycle/scooter, a car must be hatchback/sedan/suv/muv/pickup
    const allowedTypes = vehicleType === 'car' ? Vehicle.CAR_TYPES : Vehicle.BIKE_TYPES
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ error: `For a ${vehicleType}, type must be one of: ${allowedTypes.join(', ')}` })
    }

    const validPhotos = getValidPhotos(photos)
    if (!validPhotos) {
      return res.status(400).json({ error: `Please add ${MIN_PHOTOS} to ${MAX_PHOTOS} photos of your vehicle.` })
    }

    const user = await User.findById(req.userId)
    if (user.role === 'dealer' && user.subscriptionTier === 'free') {
      const activeCount = await Vehicle.countDocuments({ owner: req.userId, status: { $ne: 'sold' } })
      if (activeCount >= FREE_DEALER_LISTING_LIMIT) {
        return res.status(400).json({
          error: `Free dealer accounts are limited to ${FREE_DEALER_LISTING_LIMIT} active listings. Upgrade to Pro for unlimited listings.`,
        })
      }
    }

    const slug = await generateUniqueSlug(brand, model, year)
    const artColor = ART_COLORS[Math.floor(Math.random() * ART_COLORS.length)]

    const vehicle = new Vehicle({
      slug,
      vehicleType,
      brand,
      model,
      year,
      type,
      mileageKm,
      // an electric vehicle may send an empty engineCc; store nothing instead of null
      engineCc: isEmpty(engineCc) ? undefined : engineCc,
      price,
      negotiable,
      location,
      fuelType,
      ...getCarFields(req.body, vehicleType),
      description,
      featured: false,
      verifiedSeller: false,
      priceInsight: 'fair',
      artColor,
      photos: validPhotos,
      owner: req.userId,
    })

    await vehicle.save()
    res.status(201).json(vehicle)
  } catch (err) {
    // The model's own rules failed (for example seats: 1). That's a problem with the data sent, so 400, not 500.
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: 'Some details are not valid', details: err.message })
    }
    res.status(500).json({ error: 'Failed to create vehicle', details: err.message })
  }
})

const BOOST_DAYS = [7, 14, 30]

// PATCH /api/vehicles/:id/boost
router.patch('/:id/boost', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with id "${req.params.id}"` })
    }
    if (vehicle.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't own this listing" })
    }

    const { days } = req.body
    if (!BOOST_DAYS.includes(days)) {
      return res.status(400).json({ error: `days must be one of: ${BOOST_DAYS.join(', ')}` })
    }

    vehicle.featured = true
    vehicle.featuredUntil = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

    await vehicle.save()
    res.status(200).json(vehicle)
  } catch (err) {
    res.status(500).json({ error: 'Failed to boost vehicle', details: err.message })
  }
})

// PATCH /api/vehicles/:id
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with id "${req.params.id}"` })
    }
    if (vehicle.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't own this listing" })
    }

    const EDITABLE_FIELDS = ['price', 'negotiable', 'mileageKm', 'description', 'status']
    EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] !== undefined) {
        vehicle[field] = req.body[field]
      }
    })

    await vehicle.save()
    res.status(200).json(vehicle)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle', details: err.message })
  }
})

// DELETE /api/vehicles/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with id "${req.params.id}"` })
    }
    if (vehicle.owner.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't own this listing" })
    }

    await vehicle.deleteOne()
    // also remove this listing's photos from Cloudinary (old listings have none, so nothing happens)
    await deletePhotosFromCloudinary(vehicle.photos)
    res.status(200).json({ message: 'Vehicle deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle', details: err.message })
  }
})

module.exports = router

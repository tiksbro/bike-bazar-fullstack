const express = require('express')
const Compare = require('../models/Compare')
const Vehicle = require('../models/Vehicle')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const MAX_COMPARE = 4

// Old listings have no vehicleType, so anything that is not 'car' is a bike.
function kindOf(vehicle) {
  return vehicle.vehicleType === 'car' ? 'car' : 'bike'
}

router.use(requireAuth)

// GET /api/compare
router.get('/', async (req, res) => {
  try {
    const compares = await Compare.find({ user: req.userId }).populate('vehicle')
    const vehicles = compares.map((compare) => compare.vehicle).filter(Boolean)
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compare list', details: err.message })
  }
})

// POST /api/compare/:vehicleId
router.post('/:vehicleId', async (req, res) => {
  try {
    const existing = await Compare.findOne({ user: req.userId, vehicle: req.params.vehicleId })
    if (existing) {
      return res.status(201).json({ message: 'Vehicle added to compare list' })
    }

    // We need the vehicle itself to know if it's a bike or a car.
    const vehicle = await Vehicle.findById(req.params.vehicleId).select('vehicleType')
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' })
    }

    // Everything already in this user's compare list. `.filter(Boolean)`
    // skips entries whose vehicle was deleted, so they don't take up a slot.
    const compares = await Compare.find({ user: req.userId }).populate('vehicle', 'vehicleType')
    const listed = compares.map((compare) => compare.vehicle).filter(Boolean)

    if (listed.length >= MAX_COMPARE) {
      return res.status(400).json({ error: `You can only compare up to ${MAX_COMPARE} vehicles at a time` })
    }

    // Bikes are compared with bikes, cars with cars: comparing a scooter's
    // engine cc with an SUV's seats doesn't make sense. We look at every
    // entry (not just the first), in case an old list already mixes both.
    const newKind = kindOf(vehicle)
    const differentVehicle = listed.find((v) => kindOf(v) !== newKind)
    if (differentVehicle) {
      return res.status(400).json({
        error: `Your compare list has ${kindOf(differentVehicle)}s. Clear it first to compare ${newKind}s.`,
        // A short code the frontend can check, instead of matching the text above.
        code: 'COMPARE_TYPE_MISMATCH',
      })
    }

    await Compare.create({ user: req.userId, vehicle: req.params.vehicleId })
    res.status(201).json({ message: 'Vehicle added to compare list' })
  } catch (err) {
    // A badly shaped id (not a real MongoDB id) is the user's mistake, not a server crash.
    if (err.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid vehicle id' })
    }
    res.status(500).json({ error: 'Failed to add to compare list', details: err.message })
  }
})

// DELETE /api/compare/:vehicleId
router.delete('/:vehicleId', async (req, res) => {
  try {
    await Compare.deleteOne({ user: req.userId, vehicle: req.params.vehicleId })
    res.status(200).json({ message: 'Vehicle removed from compare list' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove from compare list', details: err.message })
  }
})

module.exports = router

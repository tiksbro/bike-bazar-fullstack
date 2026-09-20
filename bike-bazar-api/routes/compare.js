const express = require('express')
const Compare = require('../models/Compare')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const MAX_COMPARE = 4

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

    const count = await Compare.countDocuments({ user: req.userId })
    if (count >= MAX_COMPARE) {
      return res.status(400).json({ error: `You can only compare up to ${MAX_COMPARE} vehicles at a time` })
    }

    await Compare.create({ user: req.userId, vehicle: req.params.vehicleId })
    res.status(201).json({ message: 'Vehicle added to compare list' })
  } catch (err) {
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

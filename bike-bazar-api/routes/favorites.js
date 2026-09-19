const express = require('express')
const Favorite = require('../models/Favorite')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)

// GET /api/favorites
router.get('/', async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.userId }).populate('vehicle')
    const vehicles = favorites.map((favorite) => favorite.vehicle).filter(Boolean)
    res.json(vehicles)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favorites', details: err.message })
  }
})

// POST /api/favorites/:vehicleId
router.post('/:vehicleId', async (req, res) => {
  try {
    await Favorite.findOneAndUpdate(
      { user: req.userId, vehicle: req.params.vehicleId },
      { user: req.userId, vehicle: req.params.vehicleId },
      { upsert: true }
    )
    res.status(201).json({ message: 'Vehicle added to favorites' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to add favorite', details: err.message })
  }
})

// DELETE /api/favorites/:vehicleId
router.delete('/:vehicleId', async (req, res) => {
  try {
    await Favorite.deleteOne({ user: req.userId, vehicle: req.params.vehicleId })
    res.status(200).json({ message: 'Vehicle removed from favorites' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove favorite', details: err.message })
  }
})

module.exports = router

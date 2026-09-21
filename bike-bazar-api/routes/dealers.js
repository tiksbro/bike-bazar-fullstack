const express = require('express')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')

const router = express.Router()

const PUBLIC_DEALER_FIELDS = 'name businessName city brands verified subscriptionTier'

// GET /api/dealers
router.get('/', async (req, res) => {
  try {
    const dealers = await User.find({ role: 'dealer' }).select(PUBLIC_DEALER_FIELDS)
    res.json(dealers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dealers', details: err.message })
  }
})

// GET /api/dealers/:id
router.get('/:id', async (req, res) => {
  try {
    const dealer = await User.findOne({ _id: req.params.id, role: 'dealer' }).select(PUBLIC_DEALER_FIELDS)
    if (!dealer) {
      return res.status(404).json({ error: `No dealer found with id "${req.params.id}"` })
    }

    const vehicles = await Vehicle.find({ owner: dealer.id, status: { $ne: 'sold' } })

    res.json({ ...dealer.toJSON(), vehicles })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dealer', details: err.message })
  }
})

module.exports = router

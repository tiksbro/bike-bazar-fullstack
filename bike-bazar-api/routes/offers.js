const express = require('express')
const Offer = require('../models/Offer')
const Vehicle = require('../models/Vehicle')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)

// POST /api/offers/:vehicleId
router.post('/:vehicleId', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with id "${req.params.vehicleId}"` })
    }
    if (vehicle.owner.toString() === req.userId) {
      return res.status(400).json({ error: "You can't make an offer on your own listing" })
    }

    const { amount, message } = req.body
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'amount is required and must be a positive number' })
    }

    const offer = new Offer({
      buyer: req.userId,
      seller: vehicle.owner,
      vehicle: vehicle.id,
      amount,
      message,
      status: 'pending',
    })

    await offer.save()
    res.status(201).json(offer)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create offer', details: err.message })
  }
})

// GET /api/offers/received
router.get('/received', async (req, res) => {
  try {
    const offers = await Offer.find({ seller: req.userId })
      .sort({ createdAt: -1 })
      .populate('vehicle', 'brand model slug price')
      .populate('buyer', 'name')
    res.json(offers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch received offers', details: err.message })
  }
})

// GET /api/offers/sent
router.get('/sent', async (req, res) => {
  try {
    const offers = await Offer.find({ buyer: req.userId })
      .sort({ createdAt: -1 })
      .populate('vehicle', 'brand model slug')
    res.json(offers)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sent offers', details: err.message })
  }
})

// PATCH /api/offers/:id/respond
router.patch('/:id/respond', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id)
    if (!offer) {
      return res.status(404).json({ error: `No offer found with id "${req.params.id}"` })
    }
    if (offer.seller.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't own this offer" })
    }

    const { action, counterAmount } = req.body
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ error: "action must be one of: accept, reject, counter" })
    }
    if (action === 'counter' && (typeof counterAmount !== 'number' || counterAmount <= 0)) {
      return res.status(400).json({ error: 'counterAmount is required and must be a positive number when countering' })
    }

    if (action === 'accept') {
      offer.status = 'accepted'
    } else if (action === 'reject') {
      offer.status = 'rejected'
    } else {
      offer.status = 'countered'
      offer.counterAmount = counterAmount
    }

    await offer.save()
    res.status(200).json(offer)
  } catch (err) {
    res.status(500).json({ error: 'Failed to respond to offer', details: err.message })
  }
})

module.exports = router

const express = require('express')
const Rating = require('../models/Rating')
const Offer = require('../models/Offer')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)

// POST /api/ratings/:offerId
router.post('/:offerId', async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.offerId)
    if (!offer) {
      return res.status(404).json({ error: `No offer found with id "${req.params.offerId}"` })
    }
    if (offer.buyer.toString() !== req.userId) {
      return res.status(403).json({ error: "You don't own this offer" })
    }
    if (offer.status !== 'accepted') {
      return res.status(400).json({ error: 'You can only rate a completed transaction' })
    }

    const existing = await Rating.findOne({ rater: req.userId, offer: offer.id })
    if (existing) {
      return res.status(400).json({ error: "You've already rated this transaction" })
    }

    const { stars, comment } = req.body
    if (typeof stars !== 'number' || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'stars is required and must be a number between 1 and 5' })
    }

    const rating = new Rating({
      rater: req.userId,
      seller: offer.seller,
      offer: offer.id,
      stars,
      comment,
    })

    await rating.save()
    res.status(201).json(rating)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create rating', details: err.message })
  }
})

module.exports = router

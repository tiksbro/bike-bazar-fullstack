const express = require('express')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const Rating = require('../models/Rating')

const router = express.Router()

// Is the person who sent this request logged in?
// Same check as middleware/requireAuth.js, but it answers true/false
// instead of ending the request with a 401. We need that here because a
// logged-out visitor must still get the seller's NAME.
function hasValidToken(req) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)

  try {
    jwt.verify(token, process.env.JWT_SECRET)
    return true
  } catch (err) {
    // Expired, edited or nonsense token.
    return false
  }
}

// GET /api/users/:id/contact
// Always answers with the seller's name. The email is only added for
// logged-in visitors, so bots cannot collect every seller's address.
// The Privacy Policy promises this.
router.get('/:id/contact', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email')
    if (!user) {
      return res.status(404).json({ error: `No user found with id "${req.params.id}"` })
    }

    const contact = { name: user.name }
    if (hasValidToken(req)) {
      contact.email = user.email
    }

    res.json(contact)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user contact info', details: err.message })
  }
})

// GET /api/users/:id/ratings
router.get('/:id/ratings', async (req, res) => {
  try {
    const ratings = await Rating.find({ seller: req.params.id })
      .sort({ createdAt: -1 })
      .populate('rater', 'name')

    const totalCount = ratings.length
    const averageStars = totalCount === 0
      ? null
      : Math.round((ratings.reduce((sum, rating) => sum + rating.stars, 0) / totalCount) * 10) / 10

    res.json({ ratings, averageStars, totalCount })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch ratings', details: err.message })
  }
})

module.exports = router

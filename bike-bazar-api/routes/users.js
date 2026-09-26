const express = require('express')
const User = require('../models/User')
const Rating = require('../models/Rating')

const router = express.Router()

// GET /api/users/:id/contact
router.get('/:id/contact', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email')
    if (!user) {
      return res.status(404).json({ error: `No user found with id "${req.params.id}"` })
    }

    res.json({ name: user.name, email: user.email })
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

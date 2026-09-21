const express = require('express')
const User = require('../models/User')

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

module.exports = router

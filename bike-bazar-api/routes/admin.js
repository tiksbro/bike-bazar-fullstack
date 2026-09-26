const express = require('express')
const User = require('../models/User')
const Vehicle = require('../models/Vehicle')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

router.use(requireAuth)

async function requireAdmin(req, res, next) {
  try {
    const user = await User.findById(req.userId)
    if (!user || !user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    next()
  } catch (err) {
    res.status(500).json({ error: 'Failed to verify admin access', details: err.message })
  }
}

// GET /api/admin/stats
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [totalUsers, activeListings, totalDealers] = await Promise.all([
      User.countDocuments({}),
      Vehicle.countDocuments({ $or: [{ status: 'active' }, { status: { $exists: false } }] }),
      User.countDocuments({ role: 'dealer' }),
    ])

    res.json({ totalUsers, activeListings, totalDealers })
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin stats', details: err.message })
  }
})

module.exports = router

const express = require('express')
const Report = require('../models/Report')
const Vehicle = require('../models/Vehicle')
const User = require('../models/User')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const REPORT_REASONS = ['fake', 'scam', 'incorrect', 'duplicate', 'sold', 'other']
const REPORT_STATUSES = ['reviewed', 'dismissed']

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

// POST /api/reports/:vehicleId
router.post('/:vehicleId', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.vehicleId)
    if (!vehicle) {
      return res.status(404).json({ error: `No vehicle found with id "${req.params.vehicleId}"` })
    }

    const { reason } = req.body
    if (!reason || !REPORT_REASONS.includes(reason)) {
      return res.status(400).json({ error: `reason is required and must be one of: ${REPORT_REASONS.join(', ')}` })
    }

    const report = new Report({
      reporter: req.userId,
      vehicle: vehicle.id,
      reason,
      status: 'pending',
    })

    await report.save()
    res.status(201).json(report)
  } catch (err) {
    res.status(500).json({ error: 'Failed to create report', details: err.message })
  }
})

// GET /api/reports
router.get('/', requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .populate('vehicle', 'brand model slug')
      .populate('reporter', 'name')
    res.json(reports)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reports', details: err.message })
  }
})

// PATCH /api/reports/:id/status
router.patch('/:id/status', requireAdmin, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
    if (!report) {
      return res.status(404).json({ error: `No report found with id "${req.params.id}"` })
    }

    const { status } = req.body
    if (!REPORT_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${REPORT_STATUSES.join(', ')}` })
    }

    report.status = status
    await report.save()
    res.status(200).json(report)
  } catch (err) {
    res.status(500).json({ error: 'Failed to update report status', details: err.message })
  }
})

module.exports = router

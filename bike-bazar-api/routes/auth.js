const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const requireAuth = require('../middleware/requireAuth')

const router = express.Router()

const SALT_ROUNDS = 10
const TOKEN_EXPIRY = '7d'

function generateToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName, city, brands } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const normalizedRole = role === 'dealer' ? 'dealer' : 'buyer'

    if (normalizedRole === 'dealer' && (!businessName || !city)) {
      return res.status(400).json({ error: 'businessName and city are required for dealer accounts' })
    }

    const normalizedEmail = email.toLowerCase()

    const existingUser = await User.findOne({ email: normalizedEmail })
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = new User({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      businessName,
      city,
      brands,
    })
    await user.save()

    const token = generateToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user', details: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const passwordMatches = await bcrypt.compare(password, user.password)
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user)
    res.status(200).json({ token, user })
  } catch (err) {
    res.status(500).json({ error: 'Failed to log in', details: err.message })
  }
})

// PATCH /api/auth/upgrade
router.patch('/upgrade', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId)

    if (user.role !== 'dealer') {
      return res.status(400).json({ error: 'Only dealer accounts can upgrade to Pro' })
    }
    if (user.subscriptionTier === 'pro') {
      return res.status(400).json({ error: 'Already on the Pro plan' })
    }

    user.subscriptionTier = 'pro'
    await user.save()

    res.status(200).json(user)
  } catch (err) {
    res.status(500).json({ error: 'Failed to upgrade account', details: err.message })
  }
})

module.exports = router

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const vehiclesRouter = require('./routes/vehicles')
const authRouter = require('./routes/auth')
const favoritesRouter = require('./routes/favorites')
const compareRouter = require('./routes/compare')
const dealersRouter = require('./routes/dealers')
const usersRouter = require('./routes/users')
const offersRouter = require('./routes/offers')
const reportsRouter = require('./routes/reports')
const ratingsRouter = require('./routes/ratings')

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api/vehicles', vehiclesRouter)
app.use('/api/auth', authRouter)
app.use('/api/favorites', favoritesRouter)
app.use('/api/compare', compareRouter)
app.use('/api/dealers', dealersRouter)
app.use('/api/users', usersRouter)
app.use('/api/offers', offersRouter)
app.use('/api/reports', reportsRouter)
app.use('/api/ratings', ratingsRouter)

mongoose.connection.on('error', (err) => {
  console.error(`[${new Date().toISOString()}] MongoDB connection error:`, err.message)
})

mongoose.connection.on('disconnected', () => {
  console.error(`[${new Date().toISOString()}] MongoDB disconnected`)
})

mongoose
  .connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('MongoDB connected successfully')
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const vehiclesRouter = require('./routes/vehicles')
const authRouter = require('./routes/auth')
const favoritesRouter = require('./routes/favorites')
const compareRouter = require('./routes/compare')
const dealersRouter = require('./routes/dealers')

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

mongoose
  .connect(process.env.MONGODB_URI)
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

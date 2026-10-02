// ONE-TIME SCRIPT: run it once with `node mark-old-as-bikes.js` (in bike-bazar-api).
// Old listings were saved before cars existed, so they have no vehicleType in the database.
// This gives them vehicleType: 'bike', so filters like ?vehicle=bike (Phase 2) can find them.
// Safe to run again: it only touches listings that still have no vehicleType.
require('dotenv').config()

const mongoose = require('mongoose')
const Vehicle = require('./models/Vehicle')

async function markOldAsBikes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')

    const filter = { vehicleType: { $exists: false } }

    const total = await Vehicle.countDocuments({})
    const toUpdate = await Vehicle.countDocuments(filter)
    console.log(`\nTotal listings: ${total}`)
    console.log(`Listings with no vehicleType yet: ${toUpdate}`)

    if (toUpdate === 0) {
      console.log('\nNothing to do. Every listing already has a vehicleType.')
    } else {
      const result = await Vehicle.updateMany(filter, { $set: { vehicleType: 'bike' } })
      console.log(`\nMarked ${result.modifiedCount} listing(s) as bikes.`)
    }

    const bikes = await Vehicle.countDocuments({ vehicleType: 'bike' })
    const cars = await Vehicle.countDocuments({ vehicleType: 'car' })
    console.log(`Now: ${bikes} bike(s), ${cars} car(s)`)

    process.exit(0)
  } catch (err) {
    console.error('Marking old listings failed:', err.message)
    process.exit(1)
  }
}

markOldAsBikes()

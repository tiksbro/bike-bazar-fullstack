require('dotenv').config()

const mongoose = require('mongoose')
const Vehicle = require('./models/Vehicle')

const REAL_BRANDS = ['Yamaha', 'Honda', 'Bajaj', 'TVS', 'Royal Enfield', 'KTM', 'Hero', 'Suzuki', 'NIU', 'Yezdi']

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('MongoDB connected successfully')

    const filter = { brand: { $nin: REAL_BRANDS } }

    const toDelete = await Vehicle.find(filter).select('brand model _id')

    console.log(`\nFound ${toDelete.length} vehicle(s) with non-real brands:`)
    toDelete.forEach((v) => {
      console.log(`  - id: ${v._id}, brand: "${v.brand}", model: "${v.model}"`)
    })

    if (toDelete.length === 0) {
      console.log('\nNothing to delete.')
    } else {
      const result = await Vehicle.deleteMany(filter)
      console.log(`\nDeleted ${result.deletedCount} vehicle(s).`)
    }

    const remaining = await Vehicle.countDocuments({})
    console.log(`Total Vehicle count remaining: ${remaining}`)

    process.exit(0)
  } catch (err) {
    console.error('Cleanup failed:', err.message)
    process.exit(1)
  }
}

cleanup()

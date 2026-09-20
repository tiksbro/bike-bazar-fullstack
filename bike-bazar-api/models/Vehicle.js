const mongoose = require('mongoose')

const vehicleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: { type: String, enum: ['motorcycle', 'scooter'], required: true },
  year: { type: Number, required: true },
  mileageKm: { type: Number, required: true },
  engineCc: { type: Number, required: true },
  price: { type: Number, required: true },
  negotiable: { type: Boolean, default: true },
  location: { type: String, required: true },
  featured: { type: Boolean, default: false },
  verifiedSeller: { type: Boolean, default: true },
  priceInsight: { type: String, enum: ['good', 'fair', 'high'], default: 'fair' },
  artColor: { type: String, default: 'blue' },
  fuelType: { type: String, enum: ['Petrol', 'Electric'], default: 'Petrol' },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'paused', 'sold'], default: 'active' },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

vehicleSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Vehicle', vehicleSchema)

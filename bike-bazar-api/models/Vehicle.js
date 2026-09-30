const mongoose = require('mongoose')

// One uploaded photo: its Cloudinary link (url) and its Cloudinary id (publicId, needed to delete it later)
const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false })

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
  featuredUntil: { type: Date },
  verifiedSeller: { type: Boolean, default: true },
  priceInsight: { type: String, enum: ['good', 'fair', 'high'], default: 'fair' },
  artColor: { type: String, default: 'blue' },
  // photos[0] is the cover photo. Old listings have an empty list and still show the SVG art.
  photos: { type: [photoSchema], default: [] },
  fuelType: { type: String, enum: ['Petrol', 'Electric'], default: 'Petrol' },
  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'paused', 'sold'], default: 'active' },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

vehicleSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Vehicle', vehicleSchema)

const mongoose = require('mongoose')

// Body types for each kind of vehicle. A listing's `type` must come from its own list.
const BIKE_TYPES = ['motorcycle', 'scooter']
const CAR_TYPES = ['hatchback', 'sedan', 'suv', 'muv', 'pickup']

// One uploaded photo: its Cloudinary link (url) and its Cloudinary id (publicId, needed to delete it later)
const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String, required: true },
}, { _id: false })

// Small helpers so the "required only sometimes" rules below are easy to read.
// Inside these, `this` is the vehicle being saved.
function isCar() {
  return this.vehicleType === 'car'
}
function needsEngineCc() {
  return this.fuelType !== 'Electric'
}

const vehicleSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  // 'bike' or 'car'. Old listings were made before cars existed, so they count as bikes.
  vehicleType: { type: String, enum: ['bike', 'car'], default: 'bike', required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  type: {
    type: String,
    enum: [...BIKE_TYPES, ...CAR_TYPES],
    required: true,
    // A bike can't be a 'sedan', and a car can't be a 'scooter'.
    validate: {
      validator: function (value) {
        const allowedTypes = this.vehicleType === 'car' ? CAR_TYPES : BIKE_TYPES
        return allowedTypes.includes(value)
      },
      message: (props) => `"${props.value}" is not a valid type for this vehicle`,
    },
  },
  year: { type: Number, required: true },
  mileageKm: { type: Number, required: true },
  // Electric vehicles have no engine, so engineCc is only needed for the others.
  engineCc: { type: Number, required: needsEngineCc },
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
  fuelType: { type: String, enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'], default: 'Petrol' },

  // ---- Car-only fields (bikes leave these empty) ----
  transmission: { type: String, enum: ['manual', 'automatic'], required: isCar },
  seats: { type: Number, min: 2, max: 12, required: isCar },
  driveType: { type: String, enum: ['2WD', '4WD'] },
  // Electric cars only, both optional
  batteryKwh: { type: Number, min: 0 },
  rangeKm: { type: Number, min: 0 },

  description: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'paused', 'sold'], default: 'active' },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

vehicleSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

const Vehicle = mongoose.model('Vehicle', vehicleSchema)

// Shared with routes/vehicles.js so both files use the same lists
Vehicle.BIKE_TYPES = BIKE_TYPES
Vehicle.CAR_TYPES = CAR_TYPES

module.exports = Vehicle

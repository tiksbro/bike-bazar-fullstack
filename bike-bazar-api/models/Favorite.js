const mongoose = require('mongoose')

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

favoriteSchema.index({ user: 1, vehicle: 1 }, { unique: true })

favoriteSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Favorite', favoriteSchema)

const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  offer: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true },
  stars: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

ratingSchema.index({ rater: 1, offer: 1 }, { unique: true })

ratingSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Rating', ratingSchema)

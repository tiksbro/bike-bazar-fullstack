const mongoose = require('mongoose')

const compareSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
}, { toJSON: { virtuals: true }, toObject: { virtuals: true } })

compareSchema.index({ user: 1, vehicle: 1 }, { unique: true })

compareSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Compare', compareSchema)

const mongoose = require('mongoose')

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  reason: { type: String, enum: ['fake', 'scam', 'incorrect', 'duplicate', 'sold', 'other'], required: true },
  status: { type: String, enum: ['pending', 'reviewed', 'dismissed'], default: 'pending' },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

reportSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('Report', reportSchema)

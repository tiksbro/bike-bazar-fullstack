const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'dealer'], default: 'buyer' },
  businessName: { type: String },
  city: { type: String },
  brands: { type: [String] },
  verified: { type: Boolean, default: false },
  subscriptionTier: { type: String, enum: ['free', 'pro'], default: 'free' },
  isAdmin: { type: Boolean, default: false },
  // When this person ticked "I agree" on the register form.
  // Not required: accounts made before this existed simply do not have it.
  termsAcceptedAt: { type: Date },
}, {
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password
      return ret
    },
  },
  toObject: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.password
      return ret
    },
  },
})

userSchema.virtual('id').get(function () {
  return this._id.toHexString()
})

module.exports = mongoose.model('User', userSchema)

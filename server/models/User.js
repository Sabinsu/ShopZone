// server/models/User.js  ← REPLACE
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, default: '' },           // empty for Google-only accounts
  avatar:   { type: String, default: '' },
  phone:    { type: String, default: '' },
  role:     { type: String, enum: ['user','seller','admin'], default: 'user' },
  isActive: { type: Boolean, default: true },
  googleId: { type: String, default: '' },

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // Seller info
  sellerInfo: {
    storeName:   { type: String, default: '' },
    description: { type: String, default: '' },
    approved:    { type: Boolean, default: false },
    appliedAt:   { type: Date },
  },

  // Notification inbox
  notifications: [{
    message:   String,
    read:      { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],

  // AI recommendation tracking (embedded, lightweight)
  viewedProducts:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  purchasedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  resetPasswordToken:   String,
  resetPasswordExpire:  Date,
}, { timestamps: true })

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  const salt   = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false
  return bcrypt.compare(entered, this.password)
}

// Keep only last 50 viewed products
userSchema.methods.trackView = function (productId) {
  const pid  = productId.toString()
  this.viewedProducts = this.viewedProducts.filter(p => p.toString() !== pid)
  this.viewedProducts.unshift(productId)
  if (this.viewedProducts.length > 50) this.viewedProducts = this.viewedProducts.slice(0, 50)
}

module.exports = mongoose.model('User', userSchema)

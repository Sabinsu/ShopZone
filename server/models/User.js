const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type:    { type: String, enum: ['order','product','system','promo'], default: 'system' },
  read:    { type: Boolean, default: false },
  link:    { type: String, default: '' },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 6 },          // optional for OAuth users
  phone:    { type: String, default: '' },
  address: {
    street:  { type: String, default: '' },
    city:    { type: String, default: '' },
    state:   { type: String, default: '' },
    country: { type: String, default: '' },
    zip:     { type: String, default: '' },
  },
  avatar:   { type: String, default: '' },

  // ── Roles: 'user' | 'seller' | 'admin' ──
  role:     { type: String, enum: ['user', 'seller', 'admin'], default: 'user' },

  // ── Seller info (only when role === 'seller') ──
  sellerInfo: {
    storeName:   { type: String, default: '' },
    description: { type: String, default: '' },
    approved:    { type: Boolean, default: false },  // admin must approve sellers
    totalSales:  { type: Number,  default: 0 },
  },

  // ── OAuth ──
  googleId: { type: String, default: '' },

  // ── Behaviour (for AI recommendations) ──
  searchHistory: [{ type: String }],
  viewedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  wishlist:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  // ── Notifications ──
  notifications: [notificationSchema],

  // ── Account status ──
  isActive:   { type: Boolean, default: true },
  resetToken: { type: String },
  resetExpire:{ type: Date },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  if (!this.password) return false;
  return bcrypt.compare(entered, this.password);
};

// Push a notification helper
userSchema.methods.pushNotification = async function (message, type = 'system', link = '') {
  this.notifications.unshift({ message, type, link });
  if (this.notifications.length > 50) this.notifications.pop(); // keep last 50
  return this.save();
};

module.exports = mongoose.model('User', userSchema);

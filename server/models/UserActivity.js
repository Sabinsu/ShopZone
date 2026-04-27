const mongoose = require('mongoose');

// Tracks every meaningful user action for AI recommendations
const userActivitySchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  action:    { type: String, enum: ['view','click','cart','purchase','wishlist','review'], required: true },
  category:  { type: String, default: '' },
  tags:      [{ type: String }],
  duration:  { type: Number, default: 0 }, // seconds spent viewing
  score:     { type: Number, default: 1 },  // weighted score per action type
}, { timestamps: true });

userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ product: 1, action: 1 });
userActivitySchema.index({ user: 1, product: 1 }, { unique: false });

module.exports = mongoose.model('UserActivity', userActivitySchema);

// Tracks user behavior for the AI recommendation engine
const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type:    { type: String, enum: ['view', 'click', 'cart', 'purchase', 'search', 'wishlist'], required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null },
  category:{ type: String, default: '' },
  keyword: { type: String, default: '' },  // for 'search' type
  meta:    { type: Object, default: {} },
}, { timestamps: true });

// TTL index: auto-delete activities older than 90 days
userActivitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
userActivitySchema.index({ user: 1, type: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);

// server/models/Review.js
// Standalone Review collection for scalable reviews (supplements embedded reviews in Product)
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   default: null },

  rating:  { type: Number, required: true, min: 1, max: 5 },
  title:   { type: String, default: '' },
  comment: { type: String, required: true },
  images:  [{ type: String }],

  helpful:    { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }, // bought the product
}, { timestamps: true });

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

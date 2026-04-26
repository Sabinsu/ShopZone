const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  helpful: { type: Number, default: 0 },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  category:     { type: String, required: true },
  subCategory:  { type: String, default: '' },
  brand:        { type: String, default: '' },
  images:       [{ type: String }],
  stock:        { type: Number, required: true, default: 0 },
  sold:         { type: Number, default: 0 },
  ratings:      { type: Number, default: 0 },
  numReviews:   { type: Number, default: 0 },
  reviews:      [reviewSchema],
  isFeatured:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  tags:         [{ type: String }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    default: null,
  },
  externalId:  { type: String, default: '' },
  externalSrc: { type: String, default: '' },
  viewCount:   { type: Number, default: 0 },
  clickCount:  { type: Number, default: 0 },
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text', tags: 'text' });
productSchema.index({ externalId: 1, externalSrc: 1 }, { sparse: true });

productSchema.methods.updateRatings = async function () {
  if (this.reviews.length === 0) {
    this.ratings = 0; this.numReviews = 0;
  } else {
    this.ratings    = this.reviews.reduce((a, r) => a + r.rating, 0) / this.reviews.length;
    this.numReviews = this.reviews.length;
  }
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);

// server/models/Product.js  ← REPLACE
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, index: true },
  description:  { type: String, default: '' },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  images:       [{ type: String }],
  category:     { type: String, required: true, index: true,
                  enum: ['Electronics','Fashion','Home & Garden','Sports','Books','Beauty','Toys','Grocery','Other'] },

  stock:     { type: Number, default: 0, min: 0 },
  sold:      { type: Number, default: 0 },
  ratings:   { type: Number, default: 0, min: 0, max: 5 },
  numReviews:{ type: Number, default: 0 },

  isFeatured: { type: Boolean, default: false, index: true },
  isActive:   { type: Boolean, default: true,  index: true },

  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  tags: [{ type: String }],

  // Source tracking (for imported products)
  sourceUrl: { type: String, default: '' },
  externalId:{ type: String, default: '' },
}, { timestamps: true })

// Full-text search
productSchema.index({ name: 'text', description: 'text', tags: 'text' })
productSchema.index({ price: 1 })
productSchema.index({ ratings: -1 })
productSchema.index({ sold: -1 })

module.exports = mongoose.model('Product', productSchema)

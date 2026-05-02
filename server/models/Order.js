// server/models/Order.js  ← REPLACE
const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String, default: '' },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false })

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],

  shippingAddress: {
    fullName:   { type: String, required: true },
    phone:      { type: String, required: true },
    address:    { type: String, required: true },
    city:       { type: String, required: true },
    area:       { type: String, default: '' },
    postalCode: { type: String, default: '' },
  },

  paymentMethod: { type: String, enum: ['COD','Stripe','Khalti'], default: 'COD' },
  isPaid:        { type: Boolean, default: false },
  paidAt:        { type: Date },

  itemsPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending','confirmed','shipped','delivered','cancelled'],
    default: 'pending',
    index: true,
  },

  statusHistory: [{
    status:    String,
    note:      String,
    updatedAt: { type: Date, default: Date.now },
  }],

  deliveredAt:  { type: Date },
  cancelledAt:  { type: Date },
  cancelReason: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)

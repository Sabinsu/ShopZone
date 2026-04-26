const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:   { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  image:     { type: String, default: '' },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, default: 1 },
  seller:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User',
    required: true,
  },
  items:         [orderItemSchema],
  shippingAddress: {
    fullName: { type: String, required: true },
    address:  { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, default: '' },
    country:  { type: String, required: true },
    zip:      { type: String, required: true },
    phone:    { type: String, default: '' },
  },
  paymentMethod:  { type: String, enum: ['stripe', 'cod', 'esewa'], default: 'cod' },
  paymentResult: {
    id:         { type: String },
    status:     { type: String },
    update_time:{ type: String },
    email:      { type: String },
  },
  itemsPrice:    { type: Number, required: true, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true, default: 0 },
  status: {
    type: String,
    enum: ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'],
    default: 'pending',
  },
  isPaid:       { type: Boolean, default: false },
  paidAt:       { type: Date },
  isDelivered:  { type: Boolean, default: false },
  deliveredAt:  { type: Date },
  notes:        { type: String, default: '' },
  trackingNumber:{ type: String, default: '' },
}, { timestamps: true });

// Index for fast user-order lookups
orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

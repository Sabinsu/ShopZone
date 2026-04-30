const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  image:    { type: String, default: '' },
  qty:      { type: Number, required: true, min: 1 },
  category: { type: String, default: '' },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status:  { type: String, required: true },
  note:    { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items:   [orderItemSchema],

  shippingAddress: {
    name:    { type: String, required: true },
    email:   { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, default: '' },
    country: { type: String, required: true },
    zip:     { type: String, default: '' },
  },

  paymentMethod:  { type: String, enum: ['cod', 'stripe', 'esewa', 'khalti'], default: 'cod' },
  paymentResult:  { id: String, status: String, update_time: String, email: String },

  // ── Prices ──
  itemsPrice:    { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice:      { type: Number, default: 0 },
  totalPrice:    { type: Number, required: true },

  // ── Status lifecycle ──
  status: {
    type:    String,
    enum:    ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
    index:   true,
  },
  statusHistory: [statusHistorySchema],

  isPaid:      { type: Boolean, default: false },
  paidAt:      { type: Date },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
  cancelledAt: { type: Date },
  cancelReason:{ type: String, default: '' },

  // ── Shipping ──
  trackingNumber: { type: String, default: '' },
  estimatedDelivery: { type: Date },

  // ── Notes ──
  notes: { type: String, default: '' },

  // ── Seller (for multi-vendor split orders) ──
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// Push to history when status changes
orderSchema.methods.updateStatus = async function (status, note = '', updatedBy = null) {
  this.status = status;
  this.statusHistory.push({ status, note, updatedBy });

  if (status === 'delivered') {
    this.isDelivered = true;
    this.deliveredAt = new Date();
    if (this.paymentMethod === 'cod') { this.isPaid = true; this.paidAt = new Date(); }
  }
  if (status === 'cancelled') {
    this.cancelledAt = new Date();
    if (note) this.cancelReason = note;
  }

  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);

const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Order        = require('../models/Order');
const Product      = require('../models/Product');
const User         = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');

// ── POST /api/orders  ─────────────────────────────────────────────────────────
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

  if (!items?.length) return res.status(400).json({ message: 'No order items' });

  // Validate stock and prices
  for (const item of items) {
    const prod = await Product.findById(item.product);
    if (!prod) return res.status(404).json({ message: `Product ${item.name} not found` });
    if (prod.stock < item.qty) return res.status(400).json({ message: `${prod.name} — only ${prod.stock} left in stock` });
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
    status: 'pending',
    statusHistory: [{ status: 'pending', note: 'Order placed', updatedBy: req.user._id }],
  });

  // Deduct stock
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.qty, sold: item.qty },
    });
  }

  // Notify user
  const u = await User.findById(req.user._id);
  if (u?.pushNotification) {
    await u.pushNotification(
      `Order #${order._id.toString().slice(-8).toUpperCase()} placed successfully!`,
      'order',
      `/orders/${order._id}`
    );
  }

  res.status(201).json(order);
}));

// ── GET /api/orders/my  (logged-in user's orders, paginated) ──────────────────
router.get('/my', protect, asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ orders, page, pages: Math.ceil(total / limit), total });
}));

// ── GET /api/orders/:id  ──────────────────────────────────────────────────────
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate('statusHistory.updatedBy', 'name');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only admin or the owner can view
  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  res.json(order);
}));

// ── PUT /api/orders/:id/cancel  (user can cancel pending/confirmed orders) ───
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

  if (!['pending', 'confirmed'].includes(order.status))
    return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}` });

  await order.updateStatus('cancelled', req.body.reason || 'Cancelled by user', req.user._id);

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty, sold: -item.qty } });
  }

  res.json({ message: 'Order cancelled', order });
}));

// ── PUT /api/orders/:id/status  (admin only — update status) ─────────────────
router.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery } = req.body;
  const VALID = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
  if (!VALID.includes(status)) return res.status(400).json({ message: 'Invalid status' });

  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);

  await order.updateStatus(status, note || `Status updated to ${status}`, req.user._id);

  // Notify the customer
  const u = await User.findById(order.user._id);
  const msgs = {
    confirmed:  `Your order #${order._id.toString().slice(-8).toUpperCase()} has been confirmed!`,
    shipped:    `Your order #${order._id.toString().slice(-8).toUpperCase()} has shipped! ${trackingNumber ? 'Tracking: ' + trackingNumber : ''}`,
    delivered:  `Your order #${order._id.toString().slice(-8).toUpperCase()} has been delivered!`,
    cancelled:  `Your order #${order._id.toString().slice(-8).toUpperCase()} has been cancelled.`,
  };
  if (msgs[status] && u?.pushNotification) {
    await u.pushNotification(msgs[status], 'order', `/orders/${order._id}`);
  }

  res.json({ message: 'Status updated', order });
}));

// ── PUT /api/orders/:id/pay  (mark as paid — for Stripe webhook or manual) ───
router.put('/:id/pay', protect, admin, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  order.isPaid       = true;
  order.paidAt       = new Date();
  order.paymentResult = req.body.paymentResult || {};
  await order.save();
  res.json({ message: 'Marked as paid', order });
}));

// ── GET /api/orders  (admin — all orders) ─────────────────────────────────────
router.get('/', protect, admin, asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = 20;
  const status = req.query.status;
  const filter = status ? { status } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, page, pages: Math.ceil(total / limit), total });
}));

module.exports = router;

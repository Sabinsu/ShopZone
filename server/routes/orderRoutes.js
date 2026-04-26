const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Order        = require('../models/Order');
const Product      = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// ── POST /api/orders  (create order) ─────────────────────────────────────────
router.post('/', protect, asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice, notes } = req.body;

  if (!items || items.length === 0)
    return res.status(400).json({ message: 'No order items' });

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    itemsPrice:    itemsPrice    || 0,
    taxPrice:      taxPrice      || 0,
    shippingPrice: shippingPrice || 0,
    totalPrice:    totalPrice    || 0,
    notes:         notes         || '',
  });

  // Update sold count for each product
  await Promise.all(
    items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { sold: item.quantity, stock: -item.quantity } })
    )
  );

  // Notify user
  await req.user.pushNotification(
    `Order #${order._id.toString().slice(-6).toUpperCase()} placed successfully!`,
    'order',
    `/orders/${order._id}`
  ).catch(() => {});

  const populated = await order.populate('items.product', 'name images price');
  res.status(201).json(populated);
}));

// ── GET /api/orders/my  (logged-in user's orders) ────────────────────────────
router.get('/my', protect, asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 10;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('items.product', 'name images price'),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ orders, pages: Math.ceil(total / limit), total });
}));

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.product', 'name images price category');

  if (!order) return res.status(404).json({ message: 'Order not found' });

  // Only allow the owner or admin
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  res.json(order);
}));

// ── PUT /api/orders/:id/pay  (mark as paid) ───────────────────────────────────
router.put('/:id/pay', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  order.isPaid         = true;
  order.paidAt         = Date.now();
  order.status         = 'confirmed';
  order.paymentResult  = req.body.paymentResult || {};
  const updated = await order.save();
  res.json(updated);
}));

// ── PUT /api/orders/:id/cancel  (cancel order) ───────────────────────────────
router.put('/:id/cancel', protect, asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  if (['shipped', 'delivered'].includes(order.status))
    return res.status(400).json({ message: 'Cannot cancel order that is already shipped or delivered' });

  order.status = 'cancelled';
  // Restore stock
  await Promise.all(
    order.items.map(item =>
      Product.findByIdAndUpdate(item.product, { $inc: { sold: -item.quantity, stock: item.quantity } })
    )
  );

  const updated = await order.save();
  res.json(updated);
}));

// ── PUT /api/orders/:id/status  (admin: update status) ───────────────────────
router.put('/:id/status', protect, admin, asyncHandler(async (req, res) => {
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (status === 'delivered') { order.isDelivered = true; order.deliveredAt = Date.now(); }

  // Push notification to user
  if (order.user) {
    const userDoc = await require('../models/User').findById(order.user._id);
    if (userDoc) await userDoc.pushNotification(
      `Your order #${order._id.toString().slice(-6).toUpperCase()} is now ${status}.`,
      'order',
      `/orders/${order._id}`
    ).catch(() => {});
  }

  const updated = await order.save();
  res.json(updated);
}));

module.exports = router;

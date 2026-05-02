// server/controllers/orderController.js  ← REPLACE
const asyncHandler = require('express-async-handler')
const Order   = require('../models/Order')
const Product = require('../models/Product')
const User    = require('../models/User')

// POST /api/orders
exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body

  if (!items?.length) return res.status(400).json({ message: 'No items in order' })

  // Validate stock
  for (const item of items) {
    const product = await Product.findById(item.product)
    if (!product) return res.status(400).json({ message: `Product ${item.name} not found` })
    if (product.stock < item.quantity)
      return res.status(400).json({ message: `Insufficient stock for ${product.name}` })
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice,
    shippingPrice: shippingPrice || 0,
    totalPrice,
    statusHistory: [{ status: 'pending' }],
  })

  // Deduct stock + increment sold
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, sold: item.quantity },
    })
    // Track purchase for AI recommendations
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { purchasedProducts: item.product },
    })
  }

  res.status(201).json(order)
})

// GET /api/orders/my-orders
exports.getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .lean()
  res.json(orders)
})

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .lean()
  if (!order) return res.status(404).json({ message: 'Order not found' })

  // Only owner or admin
  const isOwner = order.user._id.toString() === req.user._id.toString()
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' })

  res.json(order)
})

// PUT /api/orders/:id/cancel  (user)
exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' })

  if (!['pending', 'confirmed'].includes(order.status))
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })

  order.status       = 'cancelled'
  order.cancelledAt  = new Date()
  order.cancelReason = req.body.reason || 'Cancelled by user'
  order.statusHistory.push({ status: 'cancelled', note: order.cancelReason })

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, sold: -item.quantity },
    })
  }

  await order.save()
  res.json(order)
})

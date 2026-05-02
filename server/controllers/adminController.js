// server/controllers/adminController.js  ← REPLACE
const asyncHandler = require('express-async-handler')
const User    = require('../models/User')
const Product = require('../models/Product')
const Order   = require('../models/Order')

// GET /api/admin/stats
exports.getStats = asyncHandler(async (_, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueAgg] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ])
  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
  })
})

// ── Products ─────────────────────────────────────────────────────────────────
exports.getAllProducts = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { category: { $regex: search, $options: 'i' } },
  ]
  const skip     = (Number(page) - 1) * Number(limit)
  const total    = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    .populate('seller', 'name')
  res.json({ products, total })
})

exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body)
  res.status(201).json(product)
})

exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json({ message: 'Product deleted' })
})

// ── Orders ───────────────────────────────────────────────────────────────────
exports.getAllOrders = asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (status) filter.status = status
  const skip   = (Number(page) - 1) * Number(limit)
  const total  = await Order.countDocuments(filter)
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
    .populate('user', 'name email')
  res.json({ orders, total })
})

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body
  const order = await Order.findById(req.params.id)
  if (!order) return res.status(404).json({ message: 'Order not found' })

  order.status = status
  order.statusHistory.push({ status, note: note || '' })
  if (status === 'delivered') order.deliveredAt = new Date()
  if (status === 'cancelled') order.cancelledAt = new Date()

  await order.save()

  // Notify user
  await User.findByIdAndUpdate(order.user, {
    $push: {
      notifications: {
        message: `Your order #${order._id.toString().slice(-8).toUpperCase()} is now ${status}.`,
      },
    },
  })

  res.json(order)
})

// ── Users ────────────────────────────────────────────────────────────────────
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query
  const filter = {}
  if (search) filter.$or = [
    { name:  { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ]
  const skip  = (Number(page) - 1) * Number(limit)
  const total = await User.countDocuments(filter)
  const users = await User.find(filter).select('-password')
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
  res.json({ users, total })
})

exports.updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body
  const user = await User.findByIdAndUpdate(
    req.params.id, { role }, { new: true }
  ).select('-password')
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(user)
})

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json({ message: 'User deleted' })
})

exports.approveSeller = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  user.sellerInfo.approved = true
  await user.save()
  res.json({ message: `${user.name} approved as seller` })
})

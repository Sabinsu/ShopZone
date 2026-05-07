// server/routes/sellerRoutes.js
const express      = require('express')
const asyncHandler = require('express-async-handler')
const router       = express.Router()
const Product = require('../models/Product')
const Order   = require('../models/Order')
const { protect, seller } = require('../middleware/authMiddleware')
const { upload, handleUpload } = require('../middleware/uploadMiddleware')

router.use(protect, seller)

// GET /api/seller/products
router.get('/products', asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query
  const skip = (Number(page) - 1) * Number(limit)
  const total    = await Product.countDocuments({ seller: req.user._id })
  const products = await Product.find({ seller: req.user._id })
    .sort({ createdAt: -1 }).skip(skip).limit(Number(limit))
  res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
}))

// POST /api/seller/products
router.post('/products', asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id })
  res.status(201).json(product)
}))

// PUT /api/seller/products/:id
router.put('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id })
  if (!product) return res.status(404).json({ message: 'Product not found or not yours' })
  Object.assign(product, req.body)
  await product.save()
  res.json(product)
}))

// DELETE /api/seller/products/:id
router.delete('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user._id })
  if (!product) return res.status(404).json({ message: 'Product not found or not yours' })
  res.json({ message: 'Product deleted' })
}))

// POST /api/seller/upload-image
router.post('/upload-image', upload.array('images', 5), handleUpload)

// GET /api/seller/stats
router.get('/stats', asyncHandler(async (req, res) => {
  const [totalProducts, ordersAgg] = await Promise.all([
    Product.countDocuments({ seller: req.user._id }),
    Order.aggregate([
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'productInfo' } },
      { $unwind: '$productInfo' },
      { $match: { 'productInfo.seller': req.user._id, status: { $ne: 'cancelled' } } },
      { $group: { _id: null, totalOrders: { $sum: 1 }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    ]),
  ])
  const { totalOrders = 0, revenue = 0 } = ordersAgg[0] || {}
  res.json({ totalProducts, totalOrders, revenue })
}))

module.exports = router

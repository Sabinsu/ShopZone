// server/controllers/productController.js  ← REPLACE
const asyncHandler = require('express-async-handler')
const Product = require('../models/Product')

// GET /api/products
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort = '-createdAt', minPrice, maxPrice,
          isFeatured, seller, page = 1, limit = 20 } = req.query

  const filter = { isActive: true }

  if (search) {
    filter.$or = [
      { name:        { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags:        { $regex: search, $options: 'i' } },
    ]
  }
  if (category)   filter.category   = category
  if (isFeatured) filter.isFeatured = isFeatured === 'true'
  if (seller)     filter.seller     = seller
  if (minPrice || maxPrice) {
    filter.price = {}
    if (minPrice) filter.price.$gte = Number(minPrice)
    if (maxPrice) filter.price.$lte = Number(maxPrice)
  }

  const skip  = (Number(page) - 1) * Number(limit)
  const total = await Product.countDocuments(filter)
  const products = await Product.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(Number(limit))
    .populate('seller', 'name sellerInfo.storeName')
    .lean()

  res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) })
})

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name avatar sellerInfo')
    .lean()
  if (!product) return res.status(404).json({ message: 'Product not found' })
  res.json(product)
})

// POST /api/products  (seller or admin — handled in sellerRoutes / adminRoutes)
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, seller: req.user._id })
  res.status(201).json(product)
})

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const isOwner = product.seller?.toString() === req.user._id.toString()
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' })

  Object.assign(product, req.body)
  await product.save()
  res.json(product)
})

// DELETE /api/products/:id
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ message: 'Product not found' })

  const isOwner = product.seller?.toString() === req.user._id.toString()
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' })

  await product.deleteOne()
  res.json({ message: 'Product deleted' })
})

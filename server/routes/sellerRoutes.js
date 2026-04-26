const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const { protect, seller } = require('../middleware/authMiddleware');

router.use(protect, seller);

// ── GET /api/seller/stats ─────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const products     = await Product.find({ seller: req.user._id }).select('sold price viewCount name images');
  const sellerOrders = await Order.find({ 'items.seller': req.user._id });
  const totalRevenue = sellerOrders.filter(o => o.isPaid).reduce((s, o) => {
    const mine = o.items.filter(i => i.seller?.toString() === req.user._id.toString());
    return s + mine.reduce((a, i) => a + i.price * i.quantity, 0);
  }, 0);
  res.json({
    totalProducts: products.length,
    totalOrders:   sellerOrders.length,
    totalRevenue,
    totalViews:    products.reduce((s, p) => s + (p.viewCount || 0), 0),
    totalSold:     products.reduce((s, p) => s + (p.sold || 0), 0),
  });
}));

// ── GET /api/seller/products ──────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = parseInt(req.query.limit) || 15;
  const [products, total] = await Promise.all([
    Product.find({ seller: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Product.countDocuments({ seller: req.user._id }),
  ]);
  res.json({ products, pages: Math.ceil(total / limit), total });
}));

// ── POST /api/seller/products ─────────────────────────────────────────────────
router.post('/products', asyncHandler(async (req, res) => {
  const { name, description, price, comparePrice, category, subCategory, brand,
          stock, images, tags, isFeatured, isActive } = req.body;
  if (!name || !description || !price || !category || stock === undefined)
    return res.status(400).json({ message: 'name, description, price, category and stock are required' });

  const product = await Product.create({
    name, description, price, comparePrice: comparePrice || 0,
    category, subCategory: subCategory || '', brand: brand || '',
    stock, images: images || [], tags: tags || [],
    isFeatured: isFeatured || false,
    isActive: isActive !== false,
    seller: req.user._id,
  });
  res.status(201).json(product);
}));

// ── PUT /api/seller/products/:id ──────────────────────────────────────────────
router.put('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: 'Product not found or not yours' });

  const fields = ['name','description','price','comparePrice','category','subCategory',
                  'brand','stock','images','tags','isFeatured','isActive'];
  fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  await product.save();
  res.json(product);
}));

// ── DELETE /api/seller/products/:id ──────────────────────────────────────────
router.delete('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, seller: req.user._id });
  if (!product) return res.status(404).json({ message: 'Product not found or not yours' });
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
}));

// ── GET /api/seller/orders ────────────────────────────────────────────────────
router.get('/orders', asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 15;
  const [orders, total] = await Promise.all([
    Order.find({ 'items.seller': req.user._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments({ 'items.seller': req.user._id }),
  ]);
  res.json({ orders, pages: Math.ceil(total / limit), total });
}));

module.exports = router;

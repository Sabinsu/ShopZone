const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Product      = require('../models/Product');
const { protect, admin } = require('../middleware/authMiddleware');

// ── GET /api/products  (paginated list + filters) ─────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const page     = Math.max(1, parseInt(req.query.page) || 1);
  const limit    = Math.min(50, parseInt(req.query.limit) || 12);
  const query    = { isActive: true };

  if (req.query.search)   query.$text     = { $search: req.query.search };
  if (req.query.category) query.category  = req.query.category;
  if (req.query.brand)    query.brand     = req.query.brand;
  if (req.query.featured === 'true') query.isFeatured = true;
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = +req.query.minPrice;
    if (req.query.maxPrice) query.price.$lte = +req.query.maxPrice;
  }

  let sortBy = { createdAt: -1 };
  switch (req.query.sort) {
    case 'price_asc':  sortBy = { price:  1 }; break;
    case 'price_desc': sortBy = { price: -1 }; break;
    case 'rating':     sortBy = { ratings:-1 }; break;
    case 'newest':     sortBy = { createdAt:-1 }; break;
    case 'popular':    sortBy = { sold:   -1 }; break;
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip((page - 1) * limit).limit(limit)
      .select('-reviews').populate('seller', 'name sellerInfo.storeName'),
    Product.countDocuments(query),
  ]);
  res.json({ products, pages: Math.ceil(total / limit), total, page });
}));

// ── GET /api/products/featured ────────────────────────────────────────────────
router.get('/featured', asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true, stock: { $gt: 0 } })
    .sort({ sold: -1 }).limit(parseInt(req.query.limit) || 12)
    .select('-reviews');
  res.json(products);
}));

// ── GET /api/products/categories ─────────────────────────────────────────────
router.get('/categories', asyncHandler(async (req, res) => {
  const cats = await Product.distinct('category', { isActive: true });
  res.json(cats.filter(Boolean).sort());
}));

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller', 'name sellerInfo.storeName avatar')
    .populate('reviews.user', 'name avatar');
  if (!product || !product.isActive)
    return res.status(404).json({ message: 'Product not found' });
  product.viewCount += 1;
  await product.save();
  res.json(product);
}));

// ── POST /api/products/:id/reviews ────────────────────────────────────────────
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: 'Rating and comment required' });

  const product  = await Product.findById(req.params.id);
  if (!product)  return res.status(404).json({ message: 'Product not found' });

  const already  = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (already)   return res.status(400).json({ message: 'You already reviewed this product' });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: +rating, comment });
  await product.updateRatings();
  res.status(201).json({ message: 'Review added' });
}));

// ── POST /api/products/:id/track-view ────────────────────────────────────────
router.post('/:id/track-view', protect, asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } });
  res.json({ ok: true });
}));

// ── PUT /api/products/:id  (admin/seller edit) ────────────────────────────────
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const isSeller = product.seller?.toString() === req.user._id.toString();
  if (!isSeller && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized to edit this product' });

  const editableFields = ['name','description','price','comparePrice','category','subCategory',
    'brand','stock','images','tags','isFeatured','isActive'];
  editableFields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  await product.save();
  res.json(product);
}));

// ── DELETE /api/products/:id  (admin only) ────────────────────────────────────
router.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
}));

module.exports = router;

// ── GET /api/products/recommended  (personalized or trending) ─────────────────
router.get('/recommended', asyncHandler(async (req, res) => {
  const limit    = parseInt(req.query.limit) || 10;
  const category = req.query.category;
  const filter   = { isActive: true, stock: { $gt: 0 } };
  if (category) filter.category = category;
  const products = await Product.find(filter)
    .sort({ sold: -1, ratings: -1 }).select('-reviews').limit(limit);
  res.json(products);
}));

// ── GET /api/products/trending ────────────────────────────────────────────────
router.get('/trending', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
    .sort({ viewCount: -1, sold: -1 }).select('-reviews').limit(limit);
  res.json(products);
}));

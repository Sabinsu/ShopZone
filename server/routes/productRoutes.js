const express      = require('express');
const asyncHandler = require('express-async-handler');
const multer       = require('multer');
const router       = express.Router();
const Product      = require('../models/Product');
const User         = require('../models/User');
const { protect, admin, seller } = require('../middleware/authMiddleware');
const { uploadToCloudinary }     = require('../utils/cloudinary');

// multer in-memory storage (no disk writes)
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// ── helpers ───────────────────────────────────────────────────────────────────
const buildFilter = (q) => {
  const filter = { isActive: true };
  if (q.category) filter.category = { $regex: new RegExp(`^${q.category}$`, 'i') };
  if (q.seller)   filter.seller   = q.seller;
  if (q.search)   filter.$text    = { $search: q.search };
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) filter.price.$gte = +q.minPrice;
    if (q.maxPrice) filter.price.$lte = +q.maxPrice;
  }
  return filter;
};

// ── GET /api/products  (public, paginated) ────────────────────────────────────
router.get('/', asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page)  || 1);
  const limit  = Math.min(48, parseInt(req.query.limit) || 12);
  const sort   = req.query.sort === 'price_asc'  ? { price: 1 }
               : req.query.sort === 'price_desc' ? { price: -1 }
               : req.query.sort === 'rating'     ? { ratings: -1 }
               : req.query.sort === 'newest'     ? { createdAt: -1 }
               : { isFeatured: -1, createdAt: -1 };

  const filter = buildFilter(req.query);
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit)
      .populate('seller', 'name sellerInfo.storeName avatar'),
    Product.countDocuments(filter),
  ]);
  res.json({ products, page, pages: Math.ceil(total / limit), total });
}));

// ── GET /api/products/featured ────────────────────────────────────────────────
router.get('/featured', asyncHandler(async (req, res) => {
  const products = await Product.find({ isFeatured: true, isActive: true }).limit(8)
    .populate('seller', 'name');
  res.json(products);
}));

// ── GET /api/products/recommended  (AI-based, requires auth) ─────────────────
router.get('/recommended', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('searchHistory viewedProducts');
  const keywords = [...(user.searchHistory || [])].slice(-10).join(' ').split(' ').filter(Boolean);

  let products = [];

  if (keywords.length > 0) {
    products = await Product.find(
      { $text: { $search: keywords.join(' ') }, isActive: true },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).limit(8);
  }

  // Fallback: category-based on viewed products
  if (products.length < 4 && user.viewedProducts?.length > 0) {
    const viewed   = await Product.find({ _id: { $in: user.viewedProducts.slice(-5) } }).select('category');
    const cats     = [...new Set(viewed.map(p => p.category))];
    const moreProd = await Product.find({
      category: { $in: cats },
      isActive: true,
      _id: { $nin: user.viewedProducts },
    }).sort({ ratings: -1 }).limit(8 - products.length);
    products = [...products, ...moreProd];
  }

  // Final fallback: popular
  if (products.length < 4) {
    const pop = await Product.find({ isActive: true }).sort({ sold: -1 }).limit(8);
    products  = [...products, ...pop].slice(0, 8);
  }

  res.json(products);
}));

// ── GET /api/products/:id ─────────────────────────────────────────────────────
router.get('/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('seller',         'name avatar sellerInfo')
    .populate('reviews.user',   'name avatar');
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Track views (non-blocking)
  Product.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }).exec();

  res.json(product);
}));

// ── POST /api/products  (admin or approved seller) ────────────────────────────
router.post('/', protect, seller, upload.array('images', 5), asyncHandler(async (req, res) => {
  const { name, description, price, comparePrice, category, subCategory, brand, stock, tags, isFeatured } = req.body;
  if (!name || !description || !price || !category)
    return res.status(400).json({ message: 'name, description, price, category required' });

  let images = [];
  if (req.files?.length) {
    images = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'products')));
  }

  const product = await Product.create({
    name, description,
    price:        parseFloat(price),
    comparePrice: parseFloat(comparePrice || 0),
    category, subCategory: subCategory || '', brand: brand || '',
    stock:        parseInt(stock || 0),
    tags:         tags ? JSON.parse(tags) : [],
    isFeatured:   isFeatured === 'true',
    images,
    seller:       req.user.role === 'seller' ? req.user._id : null,
  });

  res.status(201).json(product);
}));

// ── PUT /api/products/:id ─────────────────────────────────────────────────────
router.put('/:id', protect, upload.array('images', 5), asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Only admin or the owning seller can edit
  const isOwner = req.user.role === 'admin' ||
    (req.user.role === 'seller' && product.seller?.toString() === req.user._id.toString());
  if (!isOwner) return res.status(403).json({ message: 'Not authorized to edit this product' });

  const fields = ['name','description','price','comparePrice','category','subCategory','brand','stock','isFeatured','isActive'];
  fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
  if (req.body.tags) product.tags = JSON.parse(req.body.tags);

  if (req.files?.length) {
    const newImages = await Promise.all(req.files.map(f => uploadToCloudinary(f.buffer, 'products')));
    product.images = [...product.images, ...newImages];
  }

  await product.save();
  res.json(product);
}));

// ── DELETE /api/products/:id ──────────────────────────────────────────────────
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const isOwner = req.user.role === 'admin' ||
    (req.user.role === 'seller' && product.seller?.toString() === req.user._id.toString());
  if (!isOwner) return res.status(403).json({ message: 'Not authorized' });

  await product.deleteOne();
  res.json({ message: 'Product removed' });
}));

// ── POST /api/products/:id/reviews ───────────────────────────────────────────
router.post('/:id/reviews', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!rating || !comment) return res.status(400).json({ message: 'Rating and comment required' });

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) return res.status(400).json({ message: 'Product already reviewed' });

  product.reviews.push({ user: req.user._id, name: req.user.name, rating: +rating, comment });
  await product.updateRatings();
  res.status(201).json({ message: 'Review added' });
}));

// ── DELETE /api/products/:id/reviews/:reviewId (admin or own) ────────────────
router.delete('/:id/reviews/:reviewId', protect, asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const review = product.reviews.id(req.params.reviewId);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString())
    return res.status(403).json({ message: 'Not authorized' });

  review.deleteOne();
  await product.updateRatings();
  res.json({ message: 'Review removed' });
}));

// ── POST /api/products/:id/track-view (for recommendations) ──────────────────
router.post('/:id/track-view', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $push: { viewedProducts: { $each: [req.params.id], $slice: -100 } },
  });
  res.json({ ok: true });
}));

module.exports = router;

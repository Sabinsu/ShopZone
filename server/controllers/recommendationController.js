const asyncHandler  = require('express-async-handler');
const UserActivity  = require('../models/UserActivity');
const Product       = require('../models/Product');

// ── Track any user activity (view / click / cart / purchase / search) ─────────
exports.trackActivity = asyncHandler(async (req, res) => {
  const { type, productId, category, keyword, meta } = req.body;
  if (!type) return res.status(400).json({ message: 'type required' });

  await UserActivity.create({
    user:     req.user._id,
    type,
    product:  productId || null,
    category: category  || '',
    keyword:  keyword   || '',
    meta:     meta      || {},
  });

  // Also update User.viewedProducts / searchHistory for lightweight queries
  if (type === 'view' && productId) {
    const { default: User } = await import('../models/User.js');
    await User.findByIdAndUpdate(req.user._id, {
      $push: { viewedProducts: { $each: [productId], $slice: -100 } },
    });
  }
  if (type === 'search' && keyword) {
    const { default: User } = await import('../models/User.js');
    await User.findByIdAndUpdate(req.user._id, {
      $push: { searchHistory: { $each: [keyword], $slice: -50 } },
    });
  }

  res.json({ ok: true });
});

// ── GET /api/recommendations/for-you  (personalised) ─────────────────────────
exports.getForYou = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit  = Math.min(parseInt(req.query.limit) || 8, 20);

  // 1. Collect signals: categories the user engages with most
  const activities = await UserActivity.find({
    user: userId,
    type: { $in: ['view', 'cart', 'purchase', 'wishlist'] },
    product: { $ne: null },
  })
    .sort({ createdAt: -1 })
    .limit(100)
    .select('type product category');

  // Weight: purchase=5, wishlist=4, cart=3, view=1
  const WEIGHT = { purchase: 5, wishlist: 4, cart: 3, click: 2, view: 1 };

  const categoryScore = {};
  const seenProducts  = new Set();

  for (const act of activities) {
    const w = WEIGHT[act.type] || 1;
    const cat = act.category;
    if (cat) categoryScore[cat] = (categoryScore[cat] || 0) + w;
    if (act.product) seenProducts.add(act.product.toString());
  }

  const topCats = Object.entries(categoryScore)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([cat]) => cat);

  // 2. Search-keyword boosting
  const searches = await UserActivity.find({ user: userId, type: 'search' })
    .sort({ createdAt: -1 }).limit(20).select('keyword');
  const keywords = [...new Set(searches.map(s => s.keyword).filter(Boolean))].slice(0, 8);

  let products = [];

  // 3. Keyword-based text search (highest signal)
  if (keywords.length > 0) {
    const kp = await Product.find(
      { $text: { $search: keywords.join(' ') }, isActive: true },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .select('name price images ratings category sold');
    products.push(...kp);
  }

  // 4. Category-based fill
  if (topCats.length > 0 && products.length < limit) {
    const cp = await Product.find({
      category: { $in: topCats },
      isActive:  true,
      _id:       { $nin: [...seenProducts, ...products.map(p => p._id)] },
    })
      .sort({ ratings: -1, sold: -1 })
      .limit(limit - products.length)
      .select('name price images ratings category sold');
    products.push(...cp);
  }

  // 5. Popularity fallback
  if (products.length < limit) {
    const pp = await Product.find({
      isActive: true,
      _id: { $nin: products.map(p => p._id) },
    })
      .sort({ sold: -1, ratings: -1 })
      .limit(limit - products.length)
      .select('name price images ratings category sold');
    products.push(...pp);
  }

  // Deduplicate & trim
  const seen = new Set();
  const unique = products.filter(p => {
    if (seen.has(p._id.toString())) return false;
    seen.add(p._id.toString());
    return true;
  }).slice(0, limit);

  res.json({ products: unique, basedOn: topCats.length > 0 ? topCats : ['popular'] });
});

// ── GET /api/recommendations/related/:productId  ──────────────────────────────
exports.getRelated = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('category tags name brand');
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const limit = Math.min(parseInt(req.query.limit) || 6, 12);

  // Same category, same brand, similar tags — ranked by rating
  const [sameCat, sameTag] = await Promise.all([
    Product.find({
      _id:      { $ne: product._id },
      category: product.category,
      isActive: true,
    }).sort({ ratings: -1, sold: -1 }).limit(limit).select('name price images ratings category'),

    product.tags?.length > 0
      ? Product.find({
          _id:     { $ne: product._id },
          tags:    { $in: product.tags },
          isActive: true,
        }).sort({ ratings: -1 }).limit(4).select('name price images ratings category')
      : Promise.resolve([]),
  ]);

  const seen = new Set([product._id.toString()]);
  const combined = [...sameCat, ...sameTag].filter(p => {
    if (seen.has(p._id.toString())) return false;
    seen.add(p._id.toString());
    return true;
  }).slice(0, limit);

  res.json(combined);
});

// ── GET /api/recommendations/trending  (no auth needed) ──────────────────────
exports.getTrending = asyncHandler(async (req, res) => {
  const { category, limit: lim = 8 } = req.query;
  const limit  = Math.min(parseInt(lim) || 8, 20);
  const since  = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

  // Find most-purchased products in last 7 days from UserActivity
  const trending = await UserActivity.aggregate([
    { $match: { type: 'purchase', createdAt: { $gte: since }, product: { $ne: null } } },
    { $group: { _id: '$product', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
    { $limit: limit * 2 },
  ]);

  const trendingIds = trending.map(t => t._id);

  let filter = { isActive: true };
  if (category) filter.category = { $regex: new RegExp(`^${category}$`, 'i') };
  if (trendingIds.length >= 4) filter._id = { $in: trendingIds };

  let products = await Product.find(filter)
    .sort({ sold: -1, ratings: -1 })
    .limit(limit)
    .select('name price images ratings category sold viewCount');

  // Fallback to popular if trending is sparse
  if (products.length < 4) {
    products = await Product.find({ isActive: true, ...(category ? { category } : {}) })
      .sort({ sold: -1 })
      .limit(limit)
      .select('name price images ratings category sold viewCount');
  }

  res.json(products);
});

// ── GET /api/recommendations/collaborative/:productId  ────────────────────────
// "Customers who bought X also bought Y" (simple collaborative filtering)
exports.getCollaborative = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 6, 10);

  // Find users who purchased this product
  const buyers = await UserActivity.find({ type: 'purchase', product: productId })
    .select('user').limit(200);
  const buyerIds = buyers.map(b => b.user);

  if (buyerIds.length === 0) {
    // Fallback: return popular products
    const pop = await Product.find({ isActive: true, _id: { $ne: productId } })
      .sort({ sold: -1 }).limit(limit).select('name price images ratings category');
    return res.json(pop);
  }

  // Find other products those buyers also purchased
  const cobuys = await UserActivity.aggregate([
    { $match: { type: 'purchase', user: { $in: buyerIds }, product: { $ne: null, $ne: mongoose_id(productId) } } },
    { $group: { _id: '$product', count: { $sum: 1 } } },
    { $sort:  { count: -1 } },
    { $limit: limit },
  ]);

  const coIds = cobuys.map(c => c._id);
  if (coIds.length === 0) {
    const pop = await Product.find({ isActive: true, _id: { $ne: productId } })
      .sort({ sold: -1 }).limit(limit).select('name price images ratings category');
    return res.json(pop);
  }

  const products = await Product.find({ _id: { $in: coIds }, isActive: true })
    .select('name price images ratings category');
  res.json(products);
});

// helper
const mongoose_id = (id) => {
  const mongoose = require('mongoose');
  try { return new mongoose.Types.ObjectId(id); } catch { return null; }
};

const express        = require('express');
const asyncHandler   = require('express-async-handler');
const router         = express.Router();
const { protect }    = require('../middleware/authMiddleware');
const Product        = require('../models/Product');
const Order          = require('../models/Order');
const UserActivity   = require('../models/UserActivity');

// ─── Action weights for scoring ───────────────────────────────────────────────
const ACTION_SCORE = { view: 1, click: 2, cart: 4, purchase: 8, wishlist: 3, review: 5 };

// ─── POST /api/ai/track  (log user action) ────────────────────────────────────
router.post('/track', protect, asyncHandler(async (req, res) => {
  const { productId, action, duration } = req.body;
  if (!productId || !action) return res.status(400).json({ message: 'productId and action required' });

  const product = await Product.findById(productId).select('category tags');
  if (!product) return res.status(404).json({ message: 'Product not found' });

  await UserActivity.create({
    user:     req.user._id,
    product:  productId,
    action,
    category: product.category,
    tags:     product.tags,
    duration: duration || 0,
    score:    ACTION_SCORE[action] || 1,
  });

  // Also update the user's viewedProducts for quick access
  if (action === 'view' || action === 'click') {
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user._id, {
      $pull:  { viewedProducts: productId },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push:  { viewedProducts: { $each: [productId], $position: 0, $slice: 20 } },
    });
  }

  res.json({ ok: true });
}));

// ─── GET /api/ai/recommendations  (main recommendation engine) ─────────────
router.get('/recommendations', protect, asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const limit  = parseInt(req.query.limit) || 12;

  // 1. Get user's activity history (last 30 days)
  const since    = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activity = await UserActivity.find({ user: userId, createdAt: { $gte: since } })
    .sort({ score: -1, createdAt: -1 })
    .limit(50)
    .lean();

  // 2. Get purchase history — never recommend already bought
  const orders    = await Order.find({ user: userId, status: { $ne: 'cancelled' } }).select('items');
  const boughtIds = orders.flatMap(o => o.items.map(i => i.product.toString()));

  // 3. Build category + tag interest profile
  const categoryScore = {};
  const tagScore      = {};
  const seenProducts  = new Set(boughtIds);

  activity.forEach(a => {
    seenProducts.add(a.product.toString());
    if (a.category) categoryScore[a.category] = (categoryScore[a.category] || 0) + a.score;
    a.tags?.forEach(t => { tagScore[t] = (tagScore[t] || 0) + a.score; });
  });

  const topCategories = Object.entries(categoryScore).sort((a, b) => b[1] - a[1]).slice(0, 3).map(e => e[0]);
  const topTags       = Object.entries(tagScore).sort((a, b) => b[1] - a[1]).slice(0, 5).map(e => e[0]);

  // 4. Collaborative filtering (simple): find users with similar activity
  let collaborativeIds = [];
  if (activity.length > 0) {
    const productIds = activity.map(a => a.product);
    const similarUsers = await UserActivity.aggregate([
      { $match: { product: { $in: productIds }, user: { $ne: userId } } },
      { $group: { _id: '$user', overlap: { $sum: 1 } } },
      { $sort: { overlap: -1 } },
      { $limit: 5 },
    ]);
    if (similarUsers.length > 0) {
      const simUserIds   = similarUsers.map(u => u._id);
      const simActivity  = await UserActivity.find({
        user: { $in: simUserIds },
        product: { $nin: [...seenProducts] },
        action: { $in: ['purchase', 'cart', 'wishlist'] },
      }).distinct('product');
      collaborativeIds = simActivity.slice(0, 8);
    }
  }

  // 5. Build final product query — personalised
  const filter = { isActive: true, stock: { $gt: 0 }, _id: { $nin: [...seenProducts] } };

  let products = [];

  // Priority 1: collaborative filtering picks
  if (collaborativeIds.length > 0) {
    const collab = await Product.find({ ...filter, _id: { $in: collaborativeIds } })
      .select('-reviews').limit(4).lean();
    products.push(...collab);
  }

  // Priority 2: category + tag match
  if (topCategories.length > 0 || topTags.length > 0) {
    const alreadyIds = [...seenProducts, ...products.map(p => p._id.toString())];
    const personal = await Product.find({
      ...filter,
      _id: { $nin: alreadyIds },
      $or: [
        { category: { $in: topCategories } },
        { tags:     { $in: topTags }       },
      ],
    }).sort({ ratings: -1, sold: -1 }).select('-reviews').limit(8).lean();
    products.push(...personal);
  }

  // Priority 3: fallback — trending products
  if (products.length < limit) {
    const alreadyIds = [...seenProducts, ...products.map(p => p._id.toString())];
    const trending = await Product.find({ ...filter, _id: { $nin: alreadyIds } })
      .sort({ sold: -1, ratings: -1 }).select('-reviews').limit(limit).lean();
    products.push(...trending);
  }

  res.json(products.slice(0, limit));
}));

// ─── GET /api/ai/trending  (globally trending) ────────────────────────────────
router.get('/trending', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

  // Most-viewed + most-purchased in last week
  const trending = await UserActivity.aggregate([
    { $match: { createdAt: { $gte: since }, action: { $in: ['view','purchase','cart'] } } },
    { $group: { _id: '$product', score: { $sum: '$score' }, count: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: limit * 2 },
    { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $match: { 'product.isActive': true, 'product.stock': { $gt: 0 } } },
    { $replaceRoot: { newRoot: { $mergeObjects: ['$product', { trendScore: '$score', viewCount: '$count' }] } } },
    { $limit: limit },
  ]);

  // Fallback if no activity yet
  if (trending.length < 4) {
    const fallback = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ sold: -1, viewCount: -1 }).select('-reviews').limit(limit).lean();
    return res.json(fallback);
  }

  res.json(trending);
}));

// ─── GET /api/ai/related/:productId  (related products) ──────────────────────
router.get('/related/:productId', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId).select('category tags brand');
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const limit = parseInt(req.query.limit) || 8;

  // Users who viewed this also viewed:
  const alsoViewed = await UserActivity.aggregate([
    { $match: { product: product._id, action: { $in: ['view','purchase'] } } },
    { $group: { _id: '$user' } },
    { $limit: 100 },
    { $lookup: { from: 'useractivities', localField: '_id', foreignField: 'user', as: 'activity' } },
    { $unwind: '$activity' },
    { $match: { 'activity.product': { $ne: product._id } } },
    { $group: { _id: '$activity.product', score: { $sum: 1 } } },
    { $sort: { score: -1 } },
    { $limit: 12 },
  ]);

  const alsoViewedIds = alsoViewed.map(a => a._id);

  // Combine: "also viewed" + same category + same tags
  const related = await Product.find({
    isActive: true,
    stock:    { $gt: 0 },
    _id:      { $ne: product._id },
    $or: [
      { _id:      { $in: alsoViewedIds } },
      { category: product.category       },
      { tags:     { $in: product.tags }  },
      { brand:    product.brand          },
    ],
  }).sort({ ratings: -1, sold: -1 }).select('-reviews').limit(limit).lean();

  res.json(related);
}));

// ─── POST /api/ai/chat  (AI chatbot) ─────────────────────────────────────────
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client    = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });
    const products  = await Product.find({ isActive: true }).select('name category price brand').limit(20).lean();
    const catalog   = products.map(p => `${p.name} (${p.category}) - $${p.price}`).join('\n');

    const response = await client.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 256,
      system:     `You are ShopBot for ShopZone. Be concise and helpful. Catalog:\n${catalog}`,
      messages:   [...history.slice(-6), { role: 'user', content: message }],
    });
    return res.json({ reply: response.content[0]?.text || "I'm here to help!" });
  }

  // Rule-based fallback
  const msg = message.toLowerCase();
  const reply =
    msg.includes('order')   ? 'Track your orders at My Orders page!' :
    msg.includes('return')  ? '30-day hassle-free returns. Go to your order to cancel.' :
    msg.includes('payment') ? 'We accept Cash on Delivery. Stripe coming soon!' :
    msg.includes('ship')    ? 'Free shipping on orders above $50. 3–7 days delivery.' :
    msg.includes('hello') || msg.includes('hi') ? 'Hi! 👋 How can I help you today?' :
    'I can help with orders, shipping, and finding products. What are you looking for?';

  res.json({ reply });
}));

// ─── POST /api/ai/search ──────────────────────────────────────────────────────
router.post('/search', asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ message: 'Query required' });
  const products = await Product.find({ $text: { $search: query }, isActive: true })
    .sort({ score: { $meta: 'textScore' }, sold: -1 }).limit(10).select('-reviews');
  res.json({ products, query });
}));

module.exports = router;

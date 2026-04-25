// server/routes/sellerRoutes.js  ← NEW FILE
const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const { protect, seller } = require('../middleware/authMiddleware');

router.use(protect, seller);

// ── GET /api/seller/products ──────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
  res.json(products);
}));

// ── GET /api/seller/stats ─────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const products   = await Product.find({ seller: req.user._id }).select('sold price viewCount name');
  const totalRevenue = products.reduce((s, p) => s + p.sold * p.price, 0);
  const totalViews   = products.reduce((s, p) => s + p.viewCount, 0);
  const topProducts  = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);
  res.json({
    totalProducts: products.length,
    totalRevenue,
    totalViews,
    totalSold: products.reduce((s, p) => s + p.sold, 0),
    topProducts,
  });
}));

module.exports = router;

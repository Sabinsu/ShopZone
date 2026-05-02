// server/routes/reviewRoutes.js  ← NEW FILE
const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const Review       = require('../models/Review');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const { protect }  = require('../middleware/authMiddleware');

// ── GET /api/reviews/product/:productId  (public) ────────────────────────────
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20);
  res.json(reviews);
}));

// ── POST /api/reviews/:productId  (logged-in, must have bought) ───────────────
router.post('/:productId', protect, asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;
  if (!rating || !comment)
    return res.status(400).json({ message: 'Rating and comment are required' });

  // Check if already reviewed
  const exists = await Review.findOne({ product: req.params.productId, user: req.user._id });
  if (exists) return res.status(400).json({ message: 'You already reviewed this product' });

  // Check if user purchased (verified badge)
  const purchased = await Order.findOne({
    user:   req.user._id,
    status: { $in: ['delivered'] },
    'items.product': req.params.productId,
  });

  const review = await Review.create({
    product:    req.params.productId,
    user:       req.user._id,
    rating:     Number(rating),
    title:      title || '',
    comment,
    isVerified: !!purchased,
  });

  // Update product's embedded ratings average
  const allReviews = await Review.find({ product: req.params.productId });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await Product.findByIdAndUpdate(req.params.productId, {
    ratings:    parseFloat(avg.toFixed(1)),
    numReviews: allReviews.length,
  });

  await review.populate('user', 'name avatar');
  res.status(201).json(review);
}));

// ── DELETE /api/reviews/:id  (owner or admin) ─────────────────────────────────
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ message: 'Review not found' });

  const isOwner = review.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not authorized' });

  await review.deleteOne();

  // Recalculate product rating
  const allReviews = await Review.find({ product: review.product });
  const avg = allReviews.length
    ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
    : 0;
  await Product.findByIdAndUpdate(review.product, {
    ratings:    parseFloat(avg.toFixed(1)),
    numReviews: allReviews.length,
  });

  res.json({ message: 'Review deleted' });
}));

// ── PUT /api/reviews/:id/helpful ─────────────────────────────────────────────
router.put('/:id/helpful', protect, asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpful: 1 } },
    { new: true }
  );
  if (!review) return res.status(404).json({ message: 'Review not found' });
  res.json({ helpful: review.helpful });
}));

module.exports = router;

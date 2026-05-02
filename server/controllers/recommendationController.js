// server/controllers/recommendationController.js  ← REPLACE
const asyncHandler = require('express-async-handler')
const User    = require('../models/User')
const Product = require('../models/Product')

// POST /api/recommendations/track  (track views/purchases)
exports.trackAction = asyncHandler(async (req, res) => {
  const { userId, productId, action } = req.body
  if (!userId || !productId) return res.status(400).json({ message: 'userId and productId required' })

  if (action === 'view') {
    const user = await User.findById(userId)
    if (user) {
      user.trackView(productId)
      await user.save()
    }
  }
  res.json({ ok: true })
})

// GET /api/recommendations/:userId
exports.getRecommendations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId)
    .populate('viewedProducts',    'category')
    .populate('purchasedProducts', 'category')
    .lean()

  if (!user) return res.json([])

  // Gather categories the user has interacted with
  const allInteracted = [...(user.viewedProducts || []), ...(user.purchasedProducts || [])]
  const categoryMap   = {}
  allInteracted.forEach(p => {
    if (p?.category) categoryMap[p.category] = (categoryMap[p.category] || 0) + 1
  })

  // Sort categories by interaction count
  const topCategories = Object.keys(categoryMap)
    .sort((a, b) => categoryMap[b] - categoryMap[a])
    .slice(0, 3)

  // Exclude products the user has already seen
  const seenIds = allInteracted.map(p => p._id?.toString()).filter(Boolean)

  let recommendations = []

  if (topCategories.length > 0) {
    // Fetch products from top categories
    recommendations = await Product.find({
      category:  { $in: topCategories },
      isActive:  true,
      stock:     { $gt: 0 },
      _id:       { $nin: seenIds },
    })
      .sort({ ratings: -1, sold: -1 })
      .limit(10)
      .lean()
  }

  // Pad with trending products if not enough recommendations
  if (recommendations.length < 6) {
    const trending = await Product.find({
      isActive: true,
      stock:    { $gt: 0 },
      _id:      { $nin: [...seenIds, ...recommendations.map(r => r._id.toString())] },
    })
      .sort({ sold: -1, ratings: -1 })
      .limit(10 - recommendations.length)
      .lean()
    recommendations = [...recommendations, ...trending]
  }

  res.json(recommendations)
})

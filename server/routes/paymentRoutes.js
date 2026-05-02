// server/routes/paymentRoutes.js
const express      = require('express')
const asyncHandler = require('express-async-handler')
const router       = express.Router()
const { protect }  = require('../middleware/authMiddleware')

// POST /api/payment/stripe-intent  (placeholder — wire in Stripe when ready)
router.post('/stripe-intent', protect, asyncHandler(async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('xxxxx')) {
    return res.status(501).json({ message: 'Stripe not configured. Use COD.' })
  }
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  // const intent = await stripe.paymentIntents.create({ amount: req.body.amount, currency: 'npr' })
  // res.json({ clientSecret: intent.client_secret })
  res.status(501).json({ message: 'Stripe not yet configured' })
}))

module.exports = router

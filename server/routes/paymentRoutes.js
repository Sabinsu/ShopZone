const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');

// Initialize Stripe with secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// @POST /api/payment/create-intent  — create a Stripe PaymentIntent
router.post('/create-intent', protect, asyncHandler(async (req, res) => {
  const { amount } = req.body;   // amount in smallest currency unit (cents/paisa)

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   Math.round(amount * 100),  // convert to cents
    currency: 'usd',
    metadata: { userId: req.user._id.toString() },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}));

module.exports = router;

const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const { protect }  = require('../middleware/authMiddleware');

// ── POST /api/payment/create-intent  (Stripe payment intent) ─────────────────
router.post('/create-intent', protect, asyncHandler(async (req, res) => {
  const { amount, currency = 'usd' } = req.body;

  if (!process.env.STRIPE_SECRET_KEY) {
    // Return a mock client secret when Stripe isn't configured
    return res.json({
      clientSecret: `mock_secret_${Date.now()}`,
      mode: 'mock',
      message: 'Stripe not configured. Set STRIPE_SECRET_KEY to enable real payments.',
    });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // cents
    currency,
    automatic_payment_methods: { enabled: true },
  });

  res.json({ clientSecret: paymentIntent.client_secret });
}));

// ── POST /api/payment/webhook  (Stripe webhook) ───────────────────────────────
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return res.json({ received: true, mode: 'mock' });
  }
  try {
    const stripe  = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const event   = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    console.log(`[Stripe Webhook] ${event.type}`);
    res.json({ received: true });
  } catch (err) {
    console.error('[Stripe Webhook Error]', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// ── GET /api/payment/config  (public Stripe key for frontend) ─────────────────
router.get('/config', (req, res) => {
  res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '' });
});

module.exports = router;

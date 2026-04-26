const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const { protect }  = require('../middleware/authMiddleware');
const Product      = require('../models/Product');

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post('/chat', asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' });

  // If Anthropic key present, use real AI
  if (process.env.ANTHROPIC_API_KEY) {
    const Anthropic = require('@anthropic-ai/sdk');
    const client    = new Anthropic.default({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Pull a few products to give the AI context
    const products = await Product.find({ isActive: true })
      .select('name category price brand').limit(20).lean();
    const catalog  = products.map(p => `${p.name} (${p.category}) - $${p.price}`).join('\n');

    const systemPrompt = `You are ShopBot, the friendly AI assistant for ShopZone — an e-commerce marketplace.
You help customers find products, answer questions about orders, and provide shopping advice.
Be concise, helpful, and friendly. Use emoji sparingly.

Current product catalog sample:
${catalog}

Guidelines:
- Keep responses under 3 sentences
- Suggest relevant products from the catalog when appropriate
- For order issues, direct users to their Orders page
- For complex issues, suggest contacting support`;

    const msgs = [
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    const response = await client.messages.create({
      model:      'claude-opus-4-6',
      max_tokens: 256,
      system:     systemPrompt,
      messages:   msgs,
    });

    return res.json({ reply: response.content[0]?.text || "I'm here to help!" });
  }

  // ── Fallback: rule-based responses ────────────────────────────────────────
  const msg = message.toLowerCase();
  let reply  = '';

  if (msg.includes('order') && (msg.includes('track') || msg.includes('status') || msg.includes('where'))) {
    reply = 'You can track your orders in My Orders page. Go to your profile → Orders to see live status!';
  } else if (msg.includes('return') || msg.includes('refund')) {
    reply = 'We offer a 30-day hassle-free return policy. Go to your order and click "Cancel" or contact support.';
  } else if (msg.includes('payment') || msg.includes('pay')) {
    reply = 'We accept Cash on Delivery and Stripe (Credit/Debit cards). All payments are SSL-encrypted 🔒';
  } else if (msg.includes('ship') || msg.includes('deliver')) {
    reply = 'Orders above $50 get free shipping! Standard delivery takes 3–7 business days.';
  } else if (msg.includes('seller') || msg.includes('sell')) {
    reply = 'Want to sell on ShopZone? Go to Become a Seller and apply — it\'s free! ✅';
  } else if (msg.includes('discount') || msg.includes('coupon') || msg.includes('offer')) {
    reply = 'Check our Products page for items marked with discount badges. New deals are added weekly! 🏷️';
  } else if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    reply = 'Hi there! 👋 I\'m ShopBot. How can I help you today?';
  } else if (msg.includes('thank')) {
    reply = 'You\'re welcome! Happy shopping on ShopZone! 🛒';
  } else {
    // Try to find a matching product
    const words   = message.split(' ').filter(w => w.length > 3);
    const product = words.length
      ? await Product.findOne({ $text: { $search: words.slice(0,3).join(' ') }, isActive: true }).select('name price category')
      : null;
    reply = product
      ? `I found "${product.name}" in ${product.category} for $${product.price.toFixed(2)}. Check it out on our Products page! 🛒`
      : 'I can help with orders, shipping, returns and finding products. What are you looking for today?';
  }

  res.json({ reply });
}));

// ── GET /api/ai/recommendations/:userId ───────────────────────────────────────
router.get('/recommendations/:userId', protect, asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.userId && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Forbidden' });

  const viewed    = req.user.viewedProducts?.slice(-5) || [];
  const wishlist  = req.user.wishlist || [];
  const ids       = [...viewed, ...wishlist];

  // Find related products based on what the user has looked at
  let products = [];
  if (ids.length > 0) {
    const pivot    = await Product.findById(ids[0]).select('category tags');
    const filter   = { isActive: true, _id: { $nin: ids }, stock: { $gt: 0 } };
    if (pivot) filter.$or = [{ category: pivot.category }, { tags: { $in: pivot.tags } }];
    products = await Product.find(filter).sort({ ratings: -1 }).limit(8).select('-reviews');
  }
  if (products.length < 4) {
    const extra = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ sold: -1 }).limit(8).select('-reviews');
    products = [...products, ...extra.filter(p => !products.find(x => x._id.equals(p._id)))].slice(0, 8);
  }
  res.json(products);
}));

// ── POST /api/ai/search ───────────────────────────────────────────────────────
router.post('/search', asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query?.trim()) return res.status(400).json({ message: 'Query required' });

  const products = await Product.find({
    $text: { $search: query }, isActive: true,
  }).sort({ score: { $meta: 'textScore' }, sold: -1 }).limit(10).select('-reviews');

  res.json({ products, query });
}));

module.exports = router;

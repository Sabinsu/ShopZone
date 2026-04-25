// server/routes/aiRoutes.js  ← NEW FILE
const express      = require('express');
const asyncHandler = require('express-async-handler');
const axios        = require('axios');
const router       = express.Router();
const Product      = require('../models/Product');
const { protect }  = require('../middleware/authMiddleware');
const { aiLimiter } = require('../middleware/rateLimiter');

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
// Uses Claude (Anthropic) API as the AI engine.
// To use OpenAI instead, swap the axios call below.
router.post('/chat', protect, aiLimiter, asyncHandler(async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) return res.status(400).json({ message: 'Message required' });

  // Fetch top products for context (avoids hallucination)
  const topProducts = await Product.find({ isActive: true })
    .sort({ sold: -1 }).limit(20).select('name price category brand ratings');
  const productContext = topProducts.map(p =>
    `- ${p.name} | Category: ${p.category} | Price: $${p.price} | Rating: ${p.ratings.toFixed(1)}`
  ).join('\n');

  const systemPrompt = `You are ShopBot, a helpful AI assistant for ShopZone — a multi-vendor eCommerce platform.
You help customers find products, answer shopping questions, and provide order support.

Current popular products (use this for suggestions):
${productContext}

Guidelines:
- Be friendly, concise, and helpful
- Suggest specific products from the list when relevant
- For order issues, ask for order ID and guide them to contact support
- Never fabricate product details — only reference what's in the list above
- If asked about price or stock, say "check the product page for live info"
- Keep responses under 150 words unless detailed info is needed`;

  const messages = [
    ...history.slice(-6).map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ];

  // ── Call Anthropic API ────────────────────────────────────────────────────
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    { model: 'claude-sonnet-4-20250514', max_tokens: 512, system: systemPrompt, messages },
    {
      headers: {
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type':      'application/json',
      },
    }
  );

  const reply = response.data.content?.[0]?.text || "I'm sorry, I couldn't process that. Try again!";
  res.json({ reply });
}));

// ── GET /api/ai/recommendations ───────────────────────────────────────────────
router.get('/recommendations', protect, asyncHandler(async (req, res) => {
  // Simple category-based + popularity blend (no external API needed)
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = { $regex: new RegExp(`^${category}$`, 'i') };

  const [byRating, bySales] = await Promise.all([
    Product.find(filter).sort({ ratings: -1 }).limit(6).select('name price images ratings category'),
    Product.find(filter).sort({ sold: -1 }).limit(6).select('name price images ratings category'),
  ]);

  // Deduplicate by merging
  const seen = new Set();
  const combined = [...byRating, ...bySales].filter(p => {
    if (seen.has(p._id.toString())) return false;
    seen.add(p._id.toString());
    return true;
  }).slice(0, 8);

  res.json(combined);
}));

module.exports = router;

// server/routes/aiRoutes.js  ← REPLACE
const express      = require('express')
const asyncHandler = require('express-async-handler')
const router       = express.Router()
const axios        = require('axios')
const Product      = require('../models/Product')

// POST /api/ai/chat
router.post('/chat', asyncHandler(async (req, res) => {
  const { message } = req.body
  if (!message?.trim()) return res.status(400).json({ message: 'Message is required' })

  // Check for product-intent queries and fetch context
  const productKeywords = ['product','recommend','show','find','cheap','best','buy','price','deal']
  const needsProducts   = productKeywords.some(k => message.toLowerCase().includes(k))

  let productContext = ''
  if (needsProducts) {
    const products = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .sort({ ratings: -1, sold: -1 })
      .limit(6)
      .select('name category price ratings')
      .lean()

    if (products.length) {
      productContext = `\nCurrent featured products:\n${products
        .map(p => `- ${p.name} (${p.category}) — Rs ${p.price.toLocaleString()} ★${p.ratings}`)
        .join('\n')}\n`
    }
  }

  const systemPrompt = `You are ShopZone AI, a helpful shopping assistant for ShopZone ecommerce platform.
ShopZone is based in Nepal. Prices are in Nepali Rupees (Rs).
Be concise, friendly and helpful. Answer in 2-4 sentences max.
If asked about orders, tell users to visit the "My Orders" page.
If asked about returns, the policy is 7-day return for most items.
Free shipping on orders over Rs 2,000.${productContext}`

  try {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: message }],
      },
      {
        headers: {
          'x-api-key':         process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'content-type':      'application/json',
        },
        timeout: 10000,
      }
    )

    const reply = response.data.content?.[0]?.text || "I'm not sure about that. Try browsing our products!"
    res.json({ reply })
  } catch (err) {
    console.error('AI chat error:', err.message)
    res.json({ reply: "I'm having trouble right now. Please browse our products or contact support!" })
  }
}))

module.exports = router

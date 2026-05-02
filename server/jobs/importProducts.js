// server/jobs/importProducts.js
const axios   = require('axios')
const Product = require('../models/Product')

const CATEGORY_MAP = {
  "electronics":              "Electronics",
  "jewelery":                 "Fashion",
  "men's clothing":           "Fashion",
  "women's clothing":         "Fashion",
  "home decoration":          "Home & Garden",
  "furniture":                "Home & Garden",
  "fragrances":               "Beauty",
  "skincare":                 "Beauty",
  "groceries":                "Grocery",
  "smartphones":              "Electronics",
  "laptops":                  "Electronics",
  "tablets":                  "Electronics",
  "mobile-accessories":       "Electronics",
  "sports-accessories":       "Sports",
  "sunglasses":               "Fashion",
  "womens-bags":              "Fashion",
  "womens-shoes":             "Fashion",
  "mens-shoes":               "Fashion",
  "mens-watches":             "Electronics",
  "womens-watches":           "Fashion",
  "womens-jewellery":         "Fashion",
  "tops":                     "Fashion",
  "vehicle":                  "Other",
  "motorcycle":               "Other",
  "lighting":                 "Home & Garden",
}

const mapCategory = (raw) => {
  const key = (raw || '').toLowerCase()
  return CATEGORY_MAP[key] || 'Other'
}

// Convert USD to NPR (approximate)
const toNPR = (usd) => Math.round(usd * 133)

let imported = false

const runImport = async () => {
  if (imported) return
  try {
    const count = await Product.countDocuments()
    if (count >= 30) { imported = true; return }

    console.log('📦 Importing sample products...')

    // Fetch from DummyJSON (free, no API key needed)
    const { data } = await axios.get('https://dummyjson.com/products?limit=100&skip=0', { timeout: 8000 })
    const items    = data.products || []

    for (const item of items) {
      const exists = await Product.findOne({ externalId: String(item.id) })
      if (exists) continue

      const price        = toNPR(item.price)
      const comparePrice = Math.round(price * (1 + item.discountPercentage / 100))

      await Product.create({
        name:         item.title,
        description:  item.description,
        price,
        comparePrice,
        images:       item.images || [item.thumbnail],
        category:     mapCategory(item.category),
        stock:        item.stock || 50,
        ratings:      parseFloat(item.rating?.toFixed(1)) || 0,
        numReviews:   item.reviews?.length || Math.floor(Math.random() * 50),
        tags:         item.tags || [],
        isFeatured:   item.rating >= 4.5,
        externalId:   String(item.id),
        sourceUrl:    'dummyjson.com',
        sold:         Math.floor(Math.random() * 200),
      })
    }

    imported = true
    console.log(`✅ Imported ${items.length} products`)
  } catch (err) {
    console.error('❌ Product import failed:', err.message)
  }
}

module.exports = { runImport }

// server/jobs/importProducts.js
const axios   = require('axios')
const Product = require('../models/Product')

const CATEGORY_MAP = {
  "electronics":"Electronics","smartphones":"Electronics","laptops":"Electronics","tablets":"Electronics",
  "mobile-accessories":"Electronics","cameras":"Electronics","audio":"Electronics","gaming":"Electronics",
  "jewelery":"Fashion","men's clothing":"Fashion","women's clothing":"Fashion","fashion":"Fashion",
  "sunglasses":"Fashion","womens-bags":"Fashion","womens-shoes":"Fashion","mens-shoes":"Fashion",
  "mens-watches":"Electronics","womens-watches":"Fashion","womens-jewellery":"Fashion","tops":"Fashion",
  "home decoration":"Home & Garden","furniture":"Home & Garden","lighting":"Home & Garden",
  "kitchen-accessories":"Home & Garden","home-decoration":"Home & Garden",
  "fragrances":"Beauty","skincare":"Beauty","beauty":"Beauty",
  "groceries":"Grocery","food":"Grocery",
  "sports-accessories":"Sports","sports":"Sports",
  "vehicle":"Other","motorcycle":"Other",
}

const mapCat = (raw) => CATEGORY_MAP[(raw||'').toLowerCase()] || 'Other'
const toNPR  = (usd)  => Math.round(usd * 133)

let done = false

const runImport = async () => {
  if (done) return
  try {
    const count = await Product.countDocuments()
    if (count >= 20) { done = true; return }

    console.log('📦 Auto-importing products from DummyJSON...')
    const { data } = await axios.get('https://dummyjson.com/products?limit=100', { timeout: 8000 })
    const items    = data.products || []

    let n = 0
    for (const item of items) {
      const exists = await Product.findOne({ externalId: String(item.id) })
      if (exists) continue
      const price        = toNPR(item.price)
      const comparePrice = Math.round(price * (1 + (item.discountPercentage || 10) / 100))
      await Product.create({
        name:         item.title,
        description:  item.description,
        price,
        comparePrice,
        images:       [item.thumbnail, ...(item.images||[])].filter(Boolean).slice(0,4),
        category:     mapCat(item.category),
        stock:        item.stock || 50,
        ratings:      parseFloat((item.rating||4).toFixed(1)),
        numReviews:   item.reviews?.length || Math.floor(Math.random()*50)+5,
        tags:         item.tags || [],
        isFeatured:   (item.rating || 0) >= 4.5,
        externalId:   String(item.id),
        sourceUrl:    'dummyjson.com',
        sold:         Math.floor(Math.random()*500)+50,
      })
      n++
    }
    done = true
    console.log(`✅ Imported ${n} products`)
  } catch (err) {
    console.error('⚠️  Auto-import failed (DummyJSON):', err.message)
    console.log('ℹ️  Run: cd server && node seed/seedProducts.js to seed manually')
  }
}

module.exports = { runImport }

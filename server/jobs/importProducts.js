// Automatically imports products from free public APIs.
// Scheduled via node-cron (runs every 6 hours in production).
//
// Usage: require('./jobs/importProducts') in server.js
//        Or run manually: node jobs/importProducts.js

const axios   = require('axios');
const Product = require('../models/Product');

// Category mapping: external -> our categories
const CAT_MAP = {
  "electronics":       "Electronics",
  "jewelery":          "Accessories",
  "men's clothing":    "Clothing",
  "women's clothing":  "Clothing",
  "smartphones":       "Electronics",
  "laptops":           "Computers",
  "fragrances":        "Accessories",
  "skincare":          "Health & Beauty",
  "groceries":         "Food & Grocery",
  "home-decoration":   "Home & Kitchen",
  "furniture":         "Home & Kitchen",
  "tops":              "Clothing",
  "womens-dresses":    "Clothing",
  "womens-shoes":      "Footwear",
  "mens-shirts":       "Clothing",
  "mens-shoes":        "Footwear",
  "mens-watches":      "Accessories",
  "womens-watches":    "Accessories",
  "womens-bags":       "Accessories",
  "womens-jewellery":  "Accessories",
  "sunglasses":        "Accessories",
  "automotive":        "Automotive",
  "motorcycle":        "Automotive",
  "lighting":          "Home & Kitchen",
  "sports-accessories":"Sports",
};

const mapCategory = (raw) => CAT_MAP[raw?.toLowerCase()] || 'Other';

// ── Source 1: FakeStore API ───────────────────────────────────────────────────
async function importFromFakeStore() {
  const { data } = await axios.get('https://fakestoreapi.com/products?limit=100');
  let added = 0;
  for (const item of data) {
    const exists = await Product.findOne({ externalId: String(item.id), externalSrc: 'fakestore' });
    if (exists) continue;
    await Product.create({
      name:        item.title,
      description: item.description,
      price:       parseFloat(item.price.toFixed(2)),
      comparePrice:parseFloat((item.price * 1.2).toFixed(2)),
      category:    mapCategory(item.category),
      brand:       'FakeStore',
      images:      [item.image],
      stock:       Math.floor(Math.random() * 50) + 10,
      ratings:     item.rating?.rate || 0,
      numReviews:  item.rating?.count || 0,
      externalId:  String(item.id),
      externalSrc: 'fakestore',
      tags:        [item.category],
    });
    added++;
  }
  console.log(`[Import] FakeStore: +${added} products`);
  return added;
}

// ── Source 2: DummyJSON API ───────────────────────────────────────────────────
async function importFromDummyJSON() {
  const { data } = await axios.get('https://dummyjson.com/products?limit=100&skip=0');
  let added = 0;
  for (const item of data.products) {
    const exists = await Product.findOne({ externalId: String(item.id), externalSrc: 'dummyjson' });
    if (exists) continue;
    await Product.create({
      name:        item.title,
      description: item.description,
      price:       parseFloat(item.price.toFixed(2)),
      comparePrice:parseFloat(((item.price / (1 - item.discountPercentage / 100)).toFixed(2))),
      category:    mapCategory(item.category),
      brand:       item.brand || 'DummyJSON',
      images:      item.images?.slice(0, 3) || [],
      stock:       item.stock || 10,
      ratings:     item.rating || 0,
      numReviews:  item.reviews?.length || 0,
      externalId:  String(item.id),
      externalSrc: 'dummyjson',
      tags:        item.tags || [item.category],
    });
    added++;
  }
  console.log(`[Import] DummyJSON: +${added} products`);
  return added;
}

// ── Main import runner ────────────────────────────────────────────────────────
async function runImport() {
  console.log('[Import] Starting auto product import...');
  try {
    const [a, b] = await Promise.all([importFromFakeStore(), importFromDummyJSON()]);
    console.log(`[Import] Complete. Total added: ${a + b}`);
  } catch (err) {
    console.error('[Import] Error:', err.message);
  }
}

module.exports = { runImport };

// Allow direct execution: node server/jobs/importProducts.js
if (require.main === module) {
  const mongoose = require('mongoose');
  require('dotenv').config({ path: '../.env' });
  mongoose.connect(process.env.MONGO_URI)
    .then(runImport)
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
}

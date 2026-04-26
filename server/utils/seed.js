// Run with: node utils/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Product  = require('../models/Product');
const Order    = require('../models/Order');

const PRODUCTS = [
  { name:'Wireless Noise-Cancelling Headphones', description:'Premium sound with 30-hour battery life and active noise cancellation.',
    price:89.99, comparePrice:149.99, category:'Electronics', brand:'SoundPro', stock:45,
    images:['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'], isFeatured:true, tags:['audio','wireless','headphones'] },
  { name:'Slim Fit Cotton T-Shirt', description:'Breathable 100% cotton tee available in 12 colors. Preshrunk and machine washable.',
    price:19.99, comparePrice:0, category:'Fashion', brand:'StyleCo', stock:200,
    images:['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500'], isFeatured:false, tags:['clothing','casual','cotton'] },
  { name:'Stainless Steel Water Bottle 1L', description:'Double-wall insulated keeps drinks cold 24h or hot 12h. BPA-free.',
    price:29.99, comparePrice:39.99, category:'Sports', brand:'HydroMax', stock:130,
    images:['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500'], isFeatured:true, tags:['hydration','sports','eco'] },
  { name:'Smart Watch Pro Series 5', description:'Track fitness, sleep, and heart rate. Compatible with iOS & Android. 5-day battery.',
    price:199.99, comparePrice:299.99, category:'Electronics', brand:'TechWear', stock:28,
    images:['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500'], isFeatured:true, tags:['smartwatch','fitness','tech'] },
  { name:'Minimalist Leather Wallet', description:'Genuine full-grain leather, RFID-blocking, holds 8 cards + cash. Slim profile.',
    price:34.99, comparePrice:0, category:'Fashion', brand:'LeatherCraft', stock:75,
    images:['https://images.unsplash.com/photo-1627123424574-724758594913?w=500'], isFeatured:false, tags:['wallet','leather','accessory'] },
  { name:'Ergonomic Desk Lamp LED', description:'5 color temperatures, touch dimmer, USB charging port built-in. Eye-care certified.',
    price:44.99, comparePrice:64.99, category:'Home', brand:'LumiDesk', stock:60,
    images:['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500'], isFeatured:false, tags:['lamp','led','desk','home-office'] },
  { name:'Yoga Mat Premium 6mm', description:'Non-slip surface, alignment lines, eco-friendly TPE material. Includes carrying strap.',
    price:39.99, comparePrice:59.99, category:'Sports', brand:'ZenFit', stock:90,
    images:['https://images.unsplash.com/photo-1601925228873-a4e6c58f09a2?w=500'], isFeatured:true, tags:['yoga','fitness','mat'] },
  { name:'Mechanical Gaming Keyboard', description:'Blue switches, RGB backlight, compact 75% layout, USB-C detachable cable.',
    price:79.99, comparePrice:99.99, category:'Electronics', brand:'KeyMaster', stock:35,
    images:['https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500'], isFeatured:true, tags:['keyboard','gaming','mechanical'] },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
    console.log('🗑️  Cleared existing data');

    // Create admin
    const admin = await User.create({
      name: 'Admin User', email: 'admin@shopzone.com',
      password: 'admin123', role: 'admin', isActive: true,
    });

    // Create seller
    const seller = await User.create({
      name: 'Sample Seller', email: 'seller@shopzone.com',
      password: 'seller123', role: 'seller', isActive: true,
      sellerInfo: { storeName: 'Sample Store', description: 'Best products at best prices', approved: true },
    });

    // Create regular user
    await User.create({
      name: 'Test User', email: 'user@shopzone.com',
      password: 'user1234', role: 'user', isActive: true,
    });

    // Create products
    const products = await Product.insertMany(
      PRODUCTS.map(p => ({ ...p, seller: seller._id }))
    );
    console.log(`📦 Created ${products.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n👤 Test Accounts:');
    console.log('   Admin:  admin@shopzone.com  / admin123');
    console.log('   Seller: seller@shopzone.com / seller123');
    console.log('   User:   user@shopzone.com   / user1234\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();

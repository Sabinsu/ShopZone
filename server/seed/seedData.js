// server/seed/seedData.js  — run: node seed/seedData.js
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const User     = require('../models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Admin user
  const adminEmail = 'admin@shopzone.com'
  const exists = await User.findOne({ email: adminEmail })

  if (!exists) {
    await User.create({
      name:     'ShopZone Admin',
      email:    adminEmail,
      password: 'admin123456',
      role:     'admin',
    })
    console.log('✅ Admin user created: admin@shopzone.com / admin123456')
  } else {
    console.log('ℹ️  Admin already exists')
  }

  await mongoose.disconnect()
  console.log('Done.')
}

seed().catch(err => { console.error(err); process.exit(1) })

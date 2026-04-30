require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User    = require('../models/User');
const Product = require('../models/Product');
const Order   = require('../models/Order');

const PLACEHOLDER = 'https://placehold.co/600x600/e2e8f0/64748b?text=';

const products = [
  {
    name: 'iPhone 15 Pro Max', category: 'Electronics', brand: 'Apple',
    price: 1199, comparePrice: 1299, stock: 50, isFeatured: true,
    description: 'Latest Apple flagship with titanium design, A17 Pro chip, and 48MP camera system.',
    images: [`${PLACEHOLDER}iPhone+15`, `${PLACEHOLDER}iPhone+15+Back`],
    tags: ['smartphone', 'apple', '5g'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', brand: 'Samsung',
    price: 1099, comparePrice: 1199, stock: 40, isFeatured: true,
    description: 'Samsung\'s premium Android phone with built-in S Pen and 200MP camera.',
    images: [`${PLACEHOLDER}Galaxy+S24`],
    tags: ['smartphone', 'samsung', 'android'],
  },
  {
    name: 'Sony WH-1000XM5 Headphones', category: 'Electronics', brand: 'Sony',
    price: 299, comparePrice: 399, stock: 80, isFeatured: true,
    description: 'Industry-leading noise cancellation with 30-hour battery life.',
    images: [`${PLACEHOLDER}Sony+Headphones`],
    tags: ['audio', 'headphones', 'wireless'],
  },
  {
    name: 'MacBook Air M3', category: 'Computers', brand: 'Apple',
    price: 1299, comparePrice: 1499, stock: 25, isFeatured: true,
    description: '15-inch MacBook Air with M3 chip, 18-hour battery, and stunning Liquid Retina display.',
    images: [`${PLACEHOLDER}MacBook+Air`],
    tags: ['laptop', 'apple', 'macos'],
  },
  {
    name: 'Nike Air Max 270', category: 'Footwear', brand: 'Nike',
    price: 150, comparePrice: 180, stock: 120,
    description: 'Lifestyle shoe with the tallest Air unit yet for all-day comfort.',
    images: [`${PLACEHOLDER}Nike+Air+Max`],
    tags: ['shoes', 'sports', 'nike'],
  },
  {
    name: "Levi's 501 Original Jeans", category: 'Clothing', brand: "Levi's",
    price: 69, comparePrice: 89, stock: 200,
    description: 'The original straight fit jean that started it all. 100% cotton denim.',
    images: [`${PLACEHOLDER}Levis+Jeans`],
    tags: ['jeans', 'denim', 'casual'],
  },
  {
    name: 'Instant Pot Duo 7-in-1', category: 'Home & Kitchen', brand: 'Instant Pot',
    price: 79, comparePrice: 99, stock: 60, isFeatured: true,
    description: 'Multi-use programmable pressure cooker, slow cooker, rice cooker, and more.',
    images: [`${PLACEHOLDER}Instant+Pot`],
    tags: ['kitchen', 'cooking', 'appliance'],
  },
  {
    name: 'The Alchemist (Paperback)', category: 'Books', brand: 'Paulo Coelho',
    price: 14, comparePrice: 18, stock: 300,
    description: 'A magical story about following your dreams. Over 65 million copies sold worldwide.',
    images: [`${PLACEHOLDER}The+Alchemist`],
    tags: ['book', 'fiction', 'bestseller'],
  },
  {
    name: 'Yoga Mat Premium 6mm', category: 'Sports', brand: 'Manduka',
    price: 88, comparePrice: 110, stock: 90,
    description: 'Eco-certified, non-slip yoga mat with superior cushioning and durability.',
    images: [`${PLACEHOLDER}Yoga+Mat`],
    tags: ['yoga', 'fitness', 'exercise'],
  },
  {
    name: 'Dyson V15 Detect Vacuum', category: 'Home & Kitchen', brand: 'Dyson',
    price: 649, comparePrice: 749, stock: 30, isFeatured: true,
    description: 'Cordless vacuum with laser dust detection and up to 60 min run time.',
    images: [`${PLACEHOLDER}Dyson+Vacuum`],
    tags: ['vacuum', 'cleaning', 'cordless'],
  },
  {
    name: 'Adidas Ultraboost 23', category: 'Footwear', brand: 'Adidas',
    price: 190, comparePrice: 220, stock: 75,
    description: 'Premium running shoes with Boost midsole for energy return.',
    images: [`${PLACEHOLDER}Ultraboost`],
    tags: ['running', 'shoes', 'adidas'],
  },
  {
    name: 'Ray-Ban Aviator Classic', category: 'Accessories', brand: 'Ray-Ban',
    price: 161, comparePrice: 195, stock: 50,
    description: 'Iconic aviator sunglasses with 100% UV protection.',
    images: [`${PLACEHOLDER}RayBan`],
    tags: ['sunglasses', 'fashion', 'accessories'],
  },
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
    console.log('Cleared existing data');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User', email: 'admin@shop.com',
      password: 'admin123', role: 'admin',
    });

    // Create sample user
    const user = await User.create({
      name: 'John Doe', email: 'john@example.com', password: 'user123',
    });

    // Seed products
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('Admin: admin@shop.com / admin123');
    console.log('User:  john@example.com / user123');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seedDB();

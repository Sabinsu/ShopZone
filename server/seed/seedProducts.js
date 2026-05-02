// server/seed/seedProducts.js
// Run: node seed/seedProducts.js
require('dotenv').config({ path: '../.env' })
const mongoose = require('mongoose')
const Product  = require('../models/Product')
const User     = require('../models/User')

// ── Helpers ───────────────────────────────────────────────────────────────────
const npr = (usd) => Math.round(usd * 133)   // USD → NPR

const products = [

  // ══════════ ELECTRONICS ════════════════════════════════════════════════════
  {
    name: 'Apple iPhone 15 Pro Max 256GB',
    description: 'The most powerful iPhone ever. Titanium design, A17 Pro chip, 48MP camera system with 5x optical zoom. USB-C with USB 3 speeds.',
    price: npr(1199), comparePrice: npr(1299), category: 'Electronics',
    stock: 45, isFeatured: true, ratings: 4.9, numReviews: 1847,
    sold: 3240,
    images: ['https://images.unsplash.com/photo-1696426015073-fc2f45e10ade?w=600&q=80'],
    tags: ['iphone','apple','smartphone','5g'],
  },
  {
    name: 'Samsung Galaxy S24 Ultra 512GB',
    description: 'Galaxy AI is here. S Pen included. 200MP camera, titanium frame, 50x Space Zoom. The ultimate Android experience.',
    price: npr(1099), comparePrice: npr(1249), category: 'Electronics',
    stock: 38, isFeatured: true, ratings: 4.8, numReviews: 1203,
    sold: 2100,
    images: ['https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&q=80'],
    tags: ['samsung','galaxy','android','smartphone'],
  },
  {
    name: 'MacBook Pro 16" M3 Max',
    description: 'Supercharged by M3 Max chip with up to 128GB unified memory. 22-hour battery, Liquid Retina XDR display, advanced camera and audio.',
    price: npr(3499), comparePrice: npr(3799), category: 'Electronics',
    stock: 22, isFeatured: true, ratings: 4.9, numReviews: 892,
    sold: 1560,
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80'],
    tags: ['macbook','apple','laptop','m3'],
  },
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation. 30-hour battery. Crystal-clear call quality with 8 microphones. Lightweight design.',
    price: npr(399), comparePrice: npr(449), category: 'Electronics',
    stock: 78, isFeatured: false, ratings: 4.8, numReviews: 3421,
    sold: 5600,
    images: ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80'],
    tags: ['sony','headphones','noise-cancelling','wireless'],
  },
  {
    name: 'iPad Pro 13" M4 Wi-Fi 256GB',
    description: 'The thinnest Apple product ever. Ultra Retina XDR OLED display. M4 chip performance. Works with Apple Pencil Pro.',
    price: npr(1099), comparePrice: npr(1199), category: 'Electronics',
    stock: 31, isFeatured: true, ratings: 4.9, numReviews: 654,
    sold: 987,
    images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80'],
    tags: ['ipad','apple','tablet'],
  },
  {
    name: 'DJI Pocket 3 Creator Combo',
    description: '1-inch CMOS sensor, 4K/120fps video, 3-axis stabilization, OLED touchscreen. Perfect for vloggers and content creators.',
    price: npr(699), comparePrice: npr(799), category: 'Electronics',
    stock: 25, isFeatured: true, ratings: 4.7, numReviews: 445,
    sold: 876,
    images: ['https://images.unsplash.com/photo-1512574285177-09c5d60efb53?w=600&q=80'],
    tags: ['dji','camera','vlog','4k'],
  },
  {
    name: 'Samsung 65" 4K QLED Smart TV',
    description: 'Quantum Dot technology for richer colors. 4K AI Upscaling. Tizen OS with voice assistants. Ultra-slim Infinity Design.',
    price: npr(1399), comparePrice: npr(1799), category: 'Electronics',
    stock: 18, isFeatured: false, ratings: 4.7, numReviews: 789,
    sold: 1230,
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=600&q=80'],
    tags: ['samsung','tv','qled','4k'],
  },
  {
    name: 'Apple Watch Ultra 2',
    description: 'The ultimate sports and adventure watch. Titanium case, dual-frequency GPS, up to 60-hour battery, 100m water resistance.',
    price: npr(999), comparePrice: npr(1099), category: 'Electronics',
    stock: 29, isFeatured: true, ratings: 4.8, numReviews: 567,
    sold: 1100,
    images: ['https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&q=80'],
    tags: ['apple watch','smartwatch','fitness'],
  },
  {
    name: 'Bose QuietComfort Earbuds II',
    description: 'Personalized noise cancellation. Bose CustomTune technology. 6-hour battery with 3 additional charges. IPX4 rating.',
    price: npr(279), comparePrice: npr(329), category: 'Electronics',
    stock: 65, isFeatured: false, ratings: 4.7, numReviews: 2134,
    sold: 4300,
    images: ['https://images.unsplash.com/photo-1590658165737-15a047b7c35a?w=600&q=80'],
    tags: ['bose','earbuds','wireless','anc'],
  },
  {
    name: 'Nintendo Switch OLED Model',
    description: '7-inch OLED screen, enhanced audio, wide adjustable stand, 64GB internal storage. Play at home or on the go.',
    price: npr(449), comparePrice: npr(499), category: 'Electronics',
    stock: 43, isFeatured: false, ratings: 4.8, numReviews: 5678,
    sold: 8900,
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80'],
    tags: ['nintendo','gaming','switch'],
  },

  // ══════════ FASHION ════════════════════════════════════════════════════════
  {
    name: 'Premium Leather Biker Jacket',
    description: 'Hand-crafted full-grain leather. YKK zippers, quilted lining, multiple pockets. Timeless style that ages beautifully.',
    price: npr(399), comparePrice: npr(599), category: 'Fashion',
    stock: 32, isFeatured: true, ratings: 4.8, numReviews: 456,
    sold: 780,
    images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80'],
    tags: ['leather','jacket','premium'],
  },
  {
    name: 'Oversized Cashmere Blend Hoodie',
    description: 'Ultra-soft 80% cashmere blend. Relaxed fit, ribbed cuffs and hem. Available in 8 neutral colorways. Machine washable.',
    price: npr(189), comparePrice: npr(249), category: 'Fashion',
    stock: 89, isFeatured: false, ratings: 4.6, numReviews: 892,
    sold: 2300,
    images: ['https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80'],
    tags: ['hoodie','cashmere','oversized'],
  },
  {
    name: 'Classic Denim Selvedge Jeans',
    description: 'Japanese selvedge denim. Straight leg, raw indigo wash. Fades uniquely over time. Reinforced copper rivets.',
    price: npr(249), comparePrice: npr(349), category: 'Fashion',
    stock: 56, isFeatured: false, ratings: 4.7, numReviews: 678,
    sold: 1456,
    images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80'],
    tags: ['jeans','denim','selvedge'],
  },
  {
    name: 'Silk Blend Evening Dress',
    description: 'Luxurious silk-satin blend. V-neckline, bias cut, midi length. Comes in champagne, midnight blue, and deep ruby.',
    price: npr(299), comparePrice: npr(449), category: 'Fashion',
    stock: 27, isFeatured: true, ratings: 4.9, numReviews: 345,
    sold: 567,
    images: ['https://images.unsplash.com/photo-1566479179817-0b4cd9c9b27b?w=600&q=80'],
    tags: ['dress','silk','evening','luxury'],
  },
  {
    name: 'Air Jordan 1 Retro High OG',
    description: 'The original colorway returns. Premium leather upper, Air-Sole cushioning, iconic Wings logo. Heritage styling with modern comfort.',
    price: npr(249), comparePrice: npr(299), category: 'Fashion',
    stock: 44, isFeatured: true, ratings: 4.9, numReviews: 4532,
    sold: 7800,
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80'],
    tags: ['nike','jordan','sneakers','shoes'],
  },
  {
    name: 'Longchamp Le Pliage Bag',
    description: 'Iconic French design. Lightweight and foldable nylon body with genuine leather handles. Available in 50+ colors.',
    price: npr(159), comparePrice: npr(199), category: 'Fashion',
    stock: 67, isFeatured: false, ratings: 4.7, numReviews: 1234,
    sold: 2100,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80'],
    tags: ['bag','tote','longchamp','handbag'],
  },
  {
    name: 'Merino Wool Slim Suit',
    description: 'Super 120s Merino wool. Slim modern cut, half-lining. Functional buttons. Wrinkle and stain resistant. Includes matching trousers.',
    price: npr(599), comparePrice: npr(799), category: 'Fashion',
    stock: 19, isFeatured: true, ratings: 4.8, numReviews: 234,
    sold: 456,
    images: ['https://images.unsplash.com/photo-1594938298603-c8148c4b4266?w=600&q=80'],
    tags: ['suit','merino','formal'],
  },
  {
    name: 'Ray-Ban Clubmaster Classic',
    description: 'Iconic half-rim browline. B-15 lenses with 100% UV protection. Lightweight acetate and metal frame. Timeless since 1986.',
    price: npr(199), comparePrice: npr(249), category: 'Fashion',
    stock: 55, isFeatured: false, ratings: 4.7, numReviews: 1876,
    sold: 3400,
    images: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80'],
    tags: ['sunglasses','rayban','eyewear'],
  },

  // ══════════ HOME & GARDEN ══════════════════════════════════════════════════
  {
    name: 'Dyson V15 Detect Absolute',
    description: 'Laser reveals hidden dust. HEPA filtration. 60-min runtime. LCD screen shows real-time performance. Comes with 10 accessories.',
    price: npr(799), comparePrice: npr(999), category: 'Home & Garden',
    stock: 34, isFeatured: true, ratings: 4.8, numReviews: 2345,
    sold: 4200,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    tags: ['dyson','vacuum','cordless'],
  },
  {
    name: 'Instant Pot Duo 7-in-1 8Qt',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. 8 quart for families up to 8 people.',
    price: npr(179), comparePrice: npr(229), category: 'Home & Garden',
    stock: 67, isFeatured: false, ratings: 4.7, numReviews: 8934,
    sold: 12000,
    images: ['https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80'],
    tags: ['instant pot','cooking','kitchen'],
  },
  {
    name: 'Nespresso Vertuo Next Premium',
    description: 'Centrifusion™ technology extracts perfect crema. 5 cup sizes from espresso to alto. 90-second heat-up time. Recyclable pods.',
    price: npr(349), comparePrice: npr(449), category: 'Home & Garden',
    stock: 45, isFeatured: true, ratings: 4.8, numReviews: 3456,
    sold: 5600,
    images: ['https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&q=80'],
    tags: ['nespresso','coffee','espresso'],
  },
  {
    name: 'IKEA POÄNG Armchair Bundle',
    description: 'Ergonomic bent birch frame. Kotorp beige cushion. Timeless Scandinavian design. Easy assembly, 10-year guarantee.',
    price: npr(249), comparePrice: npr(299), category: 'Home & Garden',
    stock: 28, isFeatured: false, ratings: 4.6, numReviews: 6789,
    sold: 9800,
    images: ['https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&q=80'],
    tags: ['chair','furniture','ikea','scandinavian'],
  },
  {
    name: 'Philips Hue Starter Kit (4 bulbs)',
    description: '16 million colors, warm to cool white. Works with Alexa, Google Assistant, Apple HomeKit. Schedule, sync, control anywhere.',
    price: npr(149), comparePrice: npr(199), category: 'Home & Garden',
    stock: 89, isFeatured: false, ratings: 4.6, numReviews: 4321,
    sold: 7800,
    images: ['https://images.unsplash.com/photo-1558618047-f79c977f0dfd?w=600&q=80'],
    tags: ['philips hue','smart home','lights'],
  },
  {
    name: 'KitchenAid Stand Mixer 5Qt',
    description: 'Iconic tilt-head design. 59 touchpoints per revolution. 10 speeds, 59 attachments available. Cast zinc body lasts a lifetime.',
    price: npr(499), comparePrice: npr(649), category: 'Home & Garden',
    stock: 23, isFeatured: true, ratings: 4.9, numReviews: 12034,
    sold: 18000,
    images: ['https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80'],
    tags: ['kitchenaid','mixer','baking','kitchen'],
  },
  {
    name: 'Tempur-Pedic Cloud Pillow',
    description: 'Original TEMPUR material adapts to your head and neck. Stays cool, machine-washable cover. Recommended by chiropractors.',
    price: npr(179), comparePrice: npr(229), category: 'Home & Garden',
    stock: 56, isFeatured: false, ratings: 4.7, numReviews: 3456,
    sold: 5400,
    images: ['https://images.unsplash.com/photo-1584100936595-c0654b55a2e6?w=600&q=80'],
    tags: ['pillow','tempur','sleep','bedroom'],
  },

  // ══════════ BEAUTY ═════════════════════════════════════════════════════════
  {
    name: 'Charlotte Tilbury Magic Cream',
    description: 'The world\'s #1 luxury moisturizer. Rosewater, Hyaluronic Acid, Peptides. Anti-ageing. Glows in 10 minutes flat.',
    price: npr(99), comparePrice: npr(129), category: 'Beauty',
    stock: 78, isFeatured: true, ratings: 4.8, numReviews: 4532,
    sold: 7800,
    images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80'],
    tags: ['moisturizer','skincare','charlotte tilbury'],
  },
  {
    name: 'La Mer Crème de la Mer 60ml',
    description: 'The legendary moisturizer. Sea kelp Miracle Broth™. Heals, softens, lifts. Loved by celebrities worldwide for 60 years.',
    price: npr(449), comparePrice: npr(549), category: 'Beauty',
    stock: 22, isFeatured: true, ratings: 4.9, numReviews: 2134,
    sold: 3400,
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=600&q=80'],
    tags: ['la mer','luxury skincare','moisturizer'],
  },
  {
    name: 'Dyson Airwrap Complete Styler',
    description: 'Curl, wave, smooth, and dry simultaneously. No extreme heat. Includes 8 attachments. Works on all hair types.',
    price: npr(699), comparePrice: npr(849), category: 'Beauty',
    stock: 31, isFeatured: true, ratings: 4.8, numReviews: 6789,
    sold: 11000,
    images: ['https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80'],
    tags: ['dyson airwrap','hair','styling'],
  },
  {
    name: 'SK-II Facial Treatment Essence',
    description: '90% Pitera™ essence. 20+ skin benefits. Clears, smooths, firms, lifts. Cult favourite since 1980. Crystal-clear skin in 28 days.',
    price: npr(279), comparePrice: npr(349), category: 'Beauty',
    stock: 45, isFeatured: false, ratings: 4.8, numReviews: 5432,
    sold: 8900,
    images: ['https://images.unsplash.com/photo-1614859324967-bdf413c35c8c?w=600&q=80'],
    tags: ['sk-ii','essence','skincare','luxury'],
  },
  {
    name: 'Tatcha The Dewy Skin Cream',
    description: 'Hadasei-3™ complex from Japanese superfoods. Rich, creamy texture transforms dry skin to luminous glass skin. Vegan.',
    price: npr(99), comparePrice: npr(129), category: 'Beauty',
    stock: 67, isFeatured: false, ratings: 4.7, numReviews: 3210,
    sold: 5600,
    images: ['https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=600&q=80'],
    tags: ['tatcha','skincare','cream'],
  },

  // ══════════ SPORTS ═════════════════════════════════════════════════════════
  {
    name: 'Peloton Bike+ Indoor Cycling',
    description: '24" HD touchscreen, Auto-Follow resistance, rotating screen for off-bike workouts. Access to thousands of live and on-demand classes.',
    price: npr(2249), comparePrice: npr(2699), category: 'Sports',
    stock: 12, isFeatured: true, ratings: 4.8, numReviews: 3456,
    sold: 5600,
    images: ['https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=600&q=80'],
    tags: ['peloton','cycling','fitness','bike'],
  },
  {
    name: 'Lululemon Align Leggings 28"',
    description: 'Buttery soft Nulu™ fabric. Naked sensation, four-way stretch. High rise, 28" inseam. Perfect for yoga and studio.',
    price: npr(129), comparePrice: npr(149), category: 'Sports',
    stock: 89, isFeatured: false, ratings: 4.8, numReviews: 7890,
    sold: 15000,
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80'],
    tags: ['lululemon','yoga','leggings'],
  },
  {
    name: 'Garmin Fenix 7X Solar GPS Watch',
    description: '89-day battery with solar charging. Multi-band GPS, TopoActive maps, ClimbPro, full-color maps. Built for extreme adventures.',
    price: npr(999), comparePrice: npr(1199), category: 'Sports',
    stock: 24, isFeatured: true, ratings: 4.9, numReviews: 1234,
    sold: 2100,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'],
    tags: ['garmin','watch','gps','outdoor'],
  },
  {
    name: 'Yeti Hopper M20 Soft Cooler',
    description: 'ColdCell Insulation keeps ice for days. HydroLok zipper, puncture-resistant body. Holds 20 cans. Magnetic bottle opener.',
    price: npr(299), comparePrice: npr(379), category: 'Sports',
    stock: 38, isFeatured: false, ratings: 4.8, numReviews: 2345,
    sold: 4100,
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80'],
    tags: ['yeti','cooler','outdoor','camping'],
  },
  {
    name: 'TRX All-in-One Suspension Trainer',
    description: 'Train anywhere. 300+ exercises, all fitness levels. Adjustable length, door anchor included. Used by military and pro athletes.',
    price: npr(179), comparePrice: npr(219), category: 'Sports',
    stock: 55, isFeatured: false, ratings: 4.7, numReviews: 3456,
    sold: 6200,
    images: ['https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80'],
    tags: ['trx','suspension','fitness'],
  },

  // ══════════ BOOKS ══════════════════════════════════════════════════════════
  {
    name: 'Atomic Habits by James Clear',
    description: 'The #1 New York Times bestseller. Proven framework for improving every day. Over 8 million copies sold worldwide.',
    price: npr(35), comparePrice: npr(49), category: 'Books',
    stock: 200, isFeatured: false, ratings: 4.9, numReviews: 45678,
    sold: 89000,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80'],
    tags: ['habits','self-help','bestseller'],
  },
  {
    name: 'The Design of Everyday Things',
    description: 'The classic on UX design. Why some products satisfy users and others don\'t. Essential reading for designers and product managers.',
    price: npr(49), comparePrice: npr(65), category: 'Books',
    stock: 150, isFeatured: false, ratings: 4.8, numReviews: 12345,
    sold: 24000,
    images: ['https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80'],
    tags: ['design','ux','product'],
  },
  {
    name: 'Rich Dad Poor Dad',
    description: 'Robert T. Kiyosaki\'s bestselling personal finance guide. Challenges conventional wisdom about money and investing. 35M+ copies sold.',
    price: npr(29), comparePrice: npr(39), category: 'Books',
    stock: 250, isFeatured: false, ratings: 4.7, numReviews: 67890,
    sold: 120000,
    images: ['https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&q=80'],
    tags: ['finance','money','investing'],
  },

  // ══════════ GROCERY ════════════════════════════════════════════════════════
  {
    name: 'Organic Matcha Ceremonial Grade',
    description: 'Single-origin from Uji, Japan. First harvest spring leaves. Stone-ground, vibrant green, umami-rich. USDA Organic certified.',
    price: npr(69), comparePrice: npr(89), category: 'Grocery',
    stock: 120, isFeatured: true, ratings: 4.8, numReviews: 2345,
    sold: 4500,
    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80'],
    tags: ['matcha','organic','tea'],
  },
  {
    name: 'Manuka Honey MGO 850+ 500g',
    description: 'Certified New Zealand Manuka honey. MGO 850+ potency. Antimicrobial properties. Raw, unfiltered, ethically sourced.',
    price: npr(89), comparePrice: npr(119), category: 'Grocery',
    stock: 78, isFeatured: false, ratings: 4.9, numReviews: 1234,
    sold: 2300,
    images: ['https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&q=80'],
    tags: ['honey','manuka','organic'],
  },
  {
    name: 'Bulletproof Coffee Bundle Pack',
    description: 'Brain Octane C8 MCT Oil + Ground Coffee. Upgraded coffee beans, lab-tested for toxins. Keto and intermittent fasting friendly.',
    price: npr(79), comparePrice: npr(99), category: 'Grocery',
    stock: 95, isFeatured: false, ratings: 4.7, numReviews: 3456,
    sold: 6700,
    images: ['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80'],
    tags: ['coffee','bulletproof','keto'],
  },

  // ══════════ TOYS ═══════════════════════════════════════════════════════════
  {
    name: 'LEGO Technic Bugatti Chiron',
    description: '3,599 pieces. Working W16 engine, moving pistons, gearbox, spoiler. Scale model with all authentic details. Ages 16+.',
    price: npr(599), comparePrice: npr(749), category: 'Toys',
    stock: 25, isFeatured: true, ratings: 4.9, numReviews: 4567,
    sold: 7800,
    images: ['https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&q=80'],
    tags: ['lego','technic','bugatti','building'],
  },
  {
    name: 'Hot Wheels Ultimate Garage Playset',
    description: '4-feet tall, 140+ cars capacity, car wash, gas station, helicopter pad. Connects to other Hot Wheels track sets.',
    price: npr(129), comparePrice: npr(179), category: 'Toys',
    stock: 34, isFeatured: false, ratings: 4.7, numReviews: 2345,
    sold: 4500,
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80'],
    tags: ['hot wheels','cars','garage','kids'],
  },
  {
    name: 'DJI Mini 4 Pro Drone',
    description: '4K/60fps omnidirectional obstacle sensing. 34-min flight time. ActiveTrack 360°. Weighs under 249g, no license needed.',
    price: npr(899), comparePrice: npr(1049), category: 'Electronics',
    stock: 28, isFeatured: true, ratings: 4.9, numReviews: 1876,
    sold: 3200,
    images: ['https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=600&q=80'],
    tags: ['dji','drone','4k','photography'],
  },

  // ══════════ MORE ELECTRONICS ═══════════════════════════════════════════════
  {
    name: 'LG OLED evo C3 55" Smart TV',
    description: 'Self-lit pixels, perfect blacks, infinite contrast. α9 AI Processor 4K Gen6. webOS 23 with ThinQ AI. Dolby Vision & Atmos.',
    price: npr(1499), comparePrice: npr(1799), category: 'Electronics',
    stock: 16, isFeatured: true, ratings: 4.9, numReviews: 2134,
    sold: 3400,
    images: ['https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=600&q=80'],
    tags: ['lg','oled','tv','4k'],
  },
  {
    name: 'SteelSeries Arctis Nova Pro Wireless',
    description: 'Multi-system wireless. Hot-swap batteries. Active Noise Cancellation. Retractable ClearCast AI mic. Hi-Res certified.',
    price: npr(349), comparePrice: npr(449), category: 'Electronics',
    stock: 47, isFeatured: false, ratings: 4.7, numReviews: 1234,
    sold: 2100,
    images: ['https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&q=80'],
    tags: ['gaming headset','steelseries','wireless'],
  },
  {
    name: 'Logitech MX Master 3S Mouse',
    description: '8,000 DPI precision tracking. MagSpeed electromagnetic scroll. 70-day battery. Works on any surface including glass.',
    price: npr(99), comparePrice: npr(129), category: 'Electronics',
    stock: 134, isFeatured: false, ratings: 4.8, numReviews: 8934,
    sold: 16000,
    images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80'],
    tags: ['logitech','mouse','wireless','productivity'],
  },
  {
    name: 'GoPro HERO12 Black Creator Edition',
    description: '5.3K60 + 4K120 video. HyperSmooth 6.0 stabilization. Waterproof to 33ft. Comes with Creator Kit accessories.',
    price: npr(649), comparePrice: npr(749), category: 'Electronics',
    stock: 39, isFeatured: true, ratings: 4.8, numReviews: 3456,
    sold: 5600,
    images: ['https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&q=80'],
    tags: ['gopro','action camera','4k'],
  },
  {
    name: 'Keychron Q3 Max QMK Keyboard',
    description: 'Fully aluminum body. QMK/VIA compatible. Gasket-mounted for superior typing feel. Pre-lubed Banana switch. Wireless.',
    price: npr(189), comparePrice: npr(239), category: 'Electronics',
    stock: 52, isFeatured: false, ratings: 4.8, numReviews: 2345,
    sold: 3900,
    images: ['https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80'],
    tags: ['keyboard','mechanical','keychron'],
  },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('✅ Connected to MongoDB')

  // Create admin if not exists
  const adminEmail = 'admin@shopzone.com'
  const exists = await User.findOne({ email: adminEmail })
  if (!exists) {
    await User.create({ name:'ShopZone Admin', email:adminEmail, password:'admin123456', role:'admin' })
    console.log('✅ Admin user created: admin@shopzone.com / admin123456')
  }

  // Seed products
  let created = 0, skipped = 0
  for (const p of products) {
    const ex = await Product.findOne({ name: p.name })
    if (ex) { skipped++; continue }
    await Product.create(p)
    created++
    process.stdout.write(`\r📦 Seeding... ${created + skipped}/${products.length}`)
  }
  console.log(`\n✅ Done! Created: ${created}, Skipped (already exist): ${skipped}`)
  await mongoose.disconnect()
}

seed().catch(err => { console.error('❌', err); process.exit(1) })

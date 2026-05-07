// server/server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const helmet   = require('helmet');
const path     = require('path');
const cron     = require('node-cron');

dotenv.config();

// Configure Cloudinary if credentials exist
if (process.env.CLOUDINARY_CLOUD_NAME) {
  const cloudinary = require('cloudinary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('☁️  Cloudinary configured');
}

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://shop-zone-pearl.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' }, contentSecurityPolicy: false }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static uploads folder ─────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/authRoutes'));
app.use('/api/products',        require('./routes/productRoutes'));
app.use('/api/orders',          require('./routes/orderRoutes'));
app.use('/api/admin',           require('./routes/adminRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/reviews',         require('./routes/reviewRoutes'));
app.use('/api/ai',              require('./routes/aiRoutes'));
app.use('/api/seller',          require('./routes/sellerRoutes'));
app.use('/api/payment',         require('./routes/paymentRoutes'));
app.use('/api/upload',          require('./routes/uploadRoutes'));

// SEO files
app.get('/sitemap.xml', (req, res) => {
  const base = process.env.CLIENT_URL || 'https://shop-zone-pearl.vercel.app';
  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${base}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
  <url><loc>${base}/products</loc><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>${base}/about</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>${base}/login</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>
  <url><loc>${base}/register</loc><changefreq>yearly</changefreq><priority>0.5</priority></url>
</urlset>`);
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  const base = process.env.CLIENT_URL || 'https://shop-zone-pearl.vercel.app';
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /seller\nDisallow: /checkout\nSitemap: ${base}/sitemap.xml\n`);
});

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString(), version: '2.1.0' }));

// ── Error handlers ────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(400).json({ message: `${field} already in use` });
  }
  if (err.name === 'ValidationError') {
    const msg = Object.values(err.errors).map(e => e.message).join(', ');
    return res.status(400).json({ message: msg });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Invalid ID format' });
  if (err.message?.includes('CORS')) return res.status(403).json({ message: err.message });
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
    });
    if (process.env.NODE_ENV !== 'test') {
      const { runImport } = require('./jobs/importProducts');
      runImport();
      cron.schedule('0 */6 * * *', runImport);
    }
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = app;

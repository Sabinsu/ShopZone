// server/server.js  ← REPLACE existing file
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const dotenv   = require('dotenv');
const helmet   = require('helmet');
const cron     = require('node-cron');

dotenv.config();

const app = express();

// ── CORS — Vercel frontend + local dev ────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'https://shop-zone-pearl.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman / mobile
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

const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

app.use('/api/auth',            require('./routes/authRoutes'));
app.use('/api/products',        require('./routes/productRoutes'));
app.use('/api/orders',          require('./routes/orderRoutes'));
app.use('/api/admin',           require('./routes/adminRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/reviews',         require('./routes/reviewRoutes'));
app.use('/api/ai',              require('./routes/aiRoutes'));
app.use('/api/seller',          require('./routes/sellerRoutes'));
app.use('/api/payment',         require('./routes/paymentRoutes'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString(), version: '2.0.0' }));

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
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server on port ${PORT}`);
      console.log(`📡 API: https://shopzone-api.onrender.com/api`);
      console.log(`🌐 Client: https://shop-zone-pearl.vercel.app`);
    });
    if (process.env.NODE_ENV !== 'test') {
      const { runImport } = require('./jobs/importProducts');
      runImport();
      cron.schedule('0 */6 * * *', runImport);
    }
  })
  .catch(err => { console.error('❌ MongoDB failed:', err.message); process.exit(1); });

module.exports = app;

// server/server.js  ← REPLACE existing file
const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const helmet     = require('helmet');
const cron       = require('node-cron');

dotenv.config();

const app = express();

// ── Security headers ──────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Global rate limiter ───────────────────────────────────────────────────────
const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders',   require('./routes/orderRoutes'));
app.use('/api/admin',    require('./routes/adminRoutes'));
app.use('/api/payment',  require('./routes/paymentRoutes'));
app.use('/api/ai',       require('./routes/aiRoutes'));
app.use('/api/seller',   require('./routes/sellerRoutes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// ── Connect DB & Start ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // ── Auto import: run once on startup, then every 6 hours ──────────────
    if (process.env.NODE_ENV !== 'test') {
      const { runImport } = require('./jobs/importProducts');
      runImport();   // initial run
      cron.schedule('0 */6 * * *', runImport);  // every 6 hours
    }
  })
  .catch(err => { console.error(err); process.exit(1); });

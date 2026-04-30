const express   = require('express');
const mongoose  = require('mongoose');
const cors      = require('cors');
const dotenv    = require('dotenv');
const helmet    = require('helmet');
const cron      = require('node-cron');

dotenv.config();
const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const { apiLimiter } = require('./middleware/rateLimiter');
app.use('/api/', apiLimiter);

app.use('/api/auth',            require('./routes/authRoutes'));
app.use('/api/products',        require('./routes/productRoutes'));
app.use('/api/orders',          require('./routes/orderRoutes'));
app.use('/api/admin',           require('./routes/adminRoutes'));
app.use('/api/payment',         require('./routes/paymentRoutes'));
app.use('/api/ai',              require('./routes/aiRoutes'));
app.use('/api/seller',          require('./routes/sellerRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));

app.get('/api/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    if (process.env.NODE_ENV !== 'test') {
      const { runImport } = require('./jobs/importProducts');
      runImport();
      cron.schedule('0 */6 * * *', runImport);
    }
  })
  .catch(err => { console.error(err); process.exit(1); });

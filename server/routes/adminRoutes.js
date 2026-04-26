const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const User         = require('../models/User');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');

// All admin routes require protect + admin
router.use(protect, admin);

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
router.get('/analytics', asyncHandler(async (req, res) => {
  const period = req.query.period || '30d';
  const days   = period === '7d' ? 7 : period === '90d' ? 90 : period === '1y' ? 365 : 30;
  const since  = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalUsers, totalProducts, allOrders, periodOrders, topProducts, recentOrders, pendingSellers] =
    await Promise.all([
      User.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.find().select('totalPrice isPaid status createdAt user').populate('user', 'name email'),
      Order.find({ createdAt: { $gte: since } }).select('totalPrice isPaid status createdAt'),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name sold price ratings images category'),
      Order.find().sort({ createdAt: -1 }).limit(8).populate('user', 'name').select('totalPrice status createdAt user'),
      User.countDocuments({ role: 'seller', 'sellerInfo.approved': false }),
    ]);

  const paidOrders   = periodOrders.filter(o => o.isPaid);
  const totalRevenue = paidOrders.reduce((s, o) => s + o.totalPrice, 0);
  const avgOrderValue= paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const newUsers     = await User.countDocuments({ createdAt: { $gte: since } });

  // Orders by status
  const ordersByStatus = {};
  allOrders.forEach(o => { ordersByStatus[o.status] = (ordersByStatus[o.status] || 0) + 1; });

  // Daily revenue (last N days)
  const dailyRevenue = [];
  for (let i = Math.min(days, 30) - 1; i >= 0; i--) {
    const day   = new Date(); day.setDate(day.getDate() - i); day.setHours(0,0,0,0);
    const next  = new Date(day); next.setDate(next.getDate() + 1);
    const rev   = paidOrders
      .filter(o => new Date(o.createdAt) >= day && new Date(o.createdAt) < next)
      .reduce((s, o) => s + o.totalPrice, 0);
    dailyRevenue.push({ date: day.toISOString(), revenue: rev });
  }

  // Top products with revenue
  const topWithRevenue = topProducts.map(p => ({
    _id: p._id, name: p.name, sold: p.sold,
    revenue: p.sold * p.price, ratings: p.ratings,
  }));

  res.json({
    totalRevenue, totalOrders: periodOrders.length, totalUsers, totalProducts,
    avgOrderValue, newUsers, ordersByStatus, dailyRevenue,
    topProducts: topWithRevenue, recentOrders, pendingSellers,
  });
}));

// ── GET /api/admin/products ───────────────────────────────────────────────────
router.get('/products', asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = parseInt(req.query.limit) || 15;
  const search = req.query.search;
  const query  = search ? { $text: { $search: search } } : {};

  const [products, total] = await Promise.all([
    Product.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit)
      .populate('seller', 'name sellerInfo.storeName'),
    Product.countDocuments(query),
  ]);
  res.json({ products, pages: Math.ceil(total / limit), total });
}));

// ── DELETE /api/admin/products/:id ───────────────────────────────────────────
router.delete('/products/:id', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  await product.deleteOne();
  res.json({ message: 'Product deleted' });
}));

// ── PUT /api/admin/products/:id/feature ──────────────────────────────────────
router.put('/products/:id/feature', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json({ message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`, product });
}));

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = parseInt(req.query.limit) || 15;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, pages: Math.ceil(total / limit), total });
}));

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const page   = Math.max(1, parseInt(req.query.page) || 1);
  const limit  = parseInt(req.query.limit) || 15;
  const filter = {};
  if (req.query.role)   filter.role   = req.query.role;
  if (req.query.search) {
    const s = req.query.search;
    filter.$or = [{ name: { $regex: s, $options: 'i' } }, { email: { $regex: s, $options: 'i' } }];
  }

  const [users, total] = await Promise.all([
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ users, pages: Math.ceil(total / limit), total });
}));

// ── PUT /api/admin/users/:id/role ─────────────────────────────────────────────
router.put('/users/:id/role', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user._id.toString() === req.user._id.toString())
    return res.status(400).json({ message: 'Cannot change your own role' });
  user.role = req.body.role;
  await user.save();
  res.json({ message: 'Role updated', user });
}));

// ── PUT /api/admin/users/:id/approve-seller ───────────────────────────────────
router.put('/users/:id/approve-seller', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const approve = req.body.approve !== false;
  user.sellerInfo      = user.sellerInfo || {};
  user.sellerInfo.approved = approve;
  if (!approve) user.role = 'user';
  await user.save();
  await user.pushNotification(
    approve ? 'Your seller account is approved! Start listing products.' : 'Your seller application was not approved.',
    'system', approve ? '/seller' : '/'
  ).catch(() => {});
  res.json({ message: approve ? 'Seller approved' : 'Seller rejected', user });
}));

// ── PUT /api/admin/users/:id/status ───────────────────────────────────────────
router.put('/users/:id/status', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin' });
  user.isActive = req.body.isActive;
  await user.save();
  res.json({ message: 'User status updated', user });
}));

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
}));

module.exports = router;

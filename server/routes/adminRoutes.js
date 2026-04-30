const express      = require('express');
const asyncHandler = require('express-async-handler');
const router       = express.Router();
const User         = require('../models/User');
const Product      = require('../models/Product');
const Order        = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');
const { sendSellerApproval } = require('../utils/emailService');

// All admin routes require protect + admin
router.use(protect, admin);

// ── GET /api/admin/analytics ──────────────────────────────────────────────────
router.get('/analytics', asyncHandler(async (req, res) => {
  const [
    totalUsers, totalProducts, totalOrders,
    orders, newUsersThisMonth, topProducts
  ] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    Order.find().select('totalPrice isPaid isDelivered createdAt'),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().setDate(1)) } }),
    Product.find().sort({ sold: -1 }).limit(5).select('name sold price images'),
  ]);

  const totalRevenue   = orders.filter(o => o.isPaid).reduce((s, o) => s + o.totalPrice, 0);
  const pendingOrders  = orders.filter(o => !o.isDelivered).length;
  const todayOrders    = orders.filter(o => {
    const d = new Date(o.createdAt);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  }).length;

  // Revenue by month (last 6)
  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d     = new Date();
    const start = new Date(d.getFullYear(), d.getMonth() - i, 1);
    const end   = new Date(d.getFullYear(), d.getMonth() - i + 1, 0);
    const rev   = orders.filter(o => o.isPaid && o.createdAt >= start && o.createdAt <= end)
                        .reduce((s, o) => s + o.totalPrice, 0);
    monthlyRevenue.push({ month: start.toLocaleString('default', { month: 'short' }), revenue: rev });
  }

  res.json({
    totalUsers, totalProducts, totalOrders, totalRevenue,
    pendingOrders, todayOrders, newUsersThisMonth,
    topProducts, monthlyRevenue,
  });
}));

// ── GET /api/admin/users ──────────────────────────────────────────────────────
router.get('/users', asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const [users, total] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ users, pages: Math.ceil(total / limit), total });
}));

// ── PUT /api/admin/users/:id ──────────────────────────────────────────────────
router.put('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (req.body.role)     user.role     = req.body.role;
  if (req.body.isActive !== undefined) user.isActive = req.body.isActive;
  await user.save();
  res.json({ message: 'User updated', user });
}));

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────────
router.delete('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ message: 'Cannot delete admin' });
  await user.deleteOne();
  res.json({ message: 'User removed' });
}));

// ── GET /api/admin/sellers  (pending approvals) ───────────────────────────────
router.get('/sellers', asyncHandler(async (req, res) => {
  const sellers = await User.find({ role: 'seller' }).select('-password').sort({ createdAt: -1 });
  res.json(sellers);
}));

// ── PUT /api/admin/sellers/:id/approve ───────────────────────────────────────
router.put('/sellers/:id/approve', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.role !== 'seller') return res.status(404).json({ message: 'Seller not found' });
  user.sellerInfo.approved = true;
  await user.save();
  await sendSellerApproval({ to: user.email, name: user.name }).catch(console.error);
  await user.pushNotification('Your seller account has been approved! Start listing products.', 'system', '/seller/products/new');
  res.json({ message: 'Seller approved', user });
}));

// ── GET /api/admin/orders ─────────────────────────────────────────────────────
router.get('/orders', asyncHandler(async (req, res) => {
  const page  = Math.max(1, parseInt(req.query.page) || 1);
  const limit = 20;
  const [orders, total] = await Promise.all([
    Order.find().populate('user', 'name email').sort({ createdAt: -1 })
      .skip((page - 1) * limit).limit(limit),
    Order.countDocuments(),
  ]);
  res.json({ orders, pages: Math.ceil(total / limit), total });
}));

// ── PUT /api/admin/products/:id/feature ───────────────────────────────────────
router.put('/products/:id/feature', asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json({ message: `Product ${product.isFeatured ? 'featured' : 'unfeatured'}`, product });
}));

// ── GET /api/admin/import-history ────────────────────────────────────────────
router.get('/import-history', asyncHandler(async (req, res) => {
  const imported = await Product.find({ externalSrc: { $ne: '' } })
    .select('name category externalSrc createdAt price').sort({ createdAt: -1 }).limit(50);
  res.json(imported);
}));

module.exports = router;

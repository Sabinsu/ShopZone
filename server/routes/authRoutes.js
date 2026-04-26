// server/routes/authRoutes.js  ← REPLACE existing file
const express       = require('express');
const asyncHandler  = require('express-async-handler');
const crypto        = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const router        = express.Router();
const User          = require('../models/User');
const { protect, generateToken } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');
const { sendPasswordReset } = require('../utils/emailService');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ── helpers ──────────────────────────────────────────────────────────────────
const sanitize = (user) => ({
  _id: user._id, name: user.name, email: user.email,
  role: user.role, avatar: user.avatar,
  sellerInfo: user.sellerInfo,
  notifications: user.notifications?.slice(0, 10),
  token: generateToken(user._id),
});

// ── Register ─────────────────────────────────────────────────────────────────
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please fill all fields' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (await User.findOne({ email }))
    return res.status(400).json({ message: 'Email already in use' });

  const user = await User.create({ name, email, password });
  res.status(201).json(sanitize(user));
}));

// ── Login ─────────────────────────────────────────────────────────────────────
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive)
    return res.status(403).json({ message: 'Account deactivated. Contact support.' });

  res.json(sanitize(user));
}));

// ── Google OAuth ──────────────────────────────────────────────────────────────
router.post('/google', authLimiter, asyncHandler(async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Google credential required' });

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const { sub: googleId, email, name, picture } = ticket.getPayload();

  let user = await User.findOne({ $or: [{ googleId }, { email }] });
  if (!user) {
    user = await User.create({ name, email, googleId, avatar: picture, password: crypto.randomBytes(20).toString('hex') });
  } else if (!user.googleId) {
    user.googleId = googleId;
    if (!user.avatar) user.avatar = picture;
    await user.save();
  }

  res.json(sanitize(user));
}));

// ── Get Profile ───────────────────────────────────────────────────────────────
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('wishlist', 'name price images');
  res.json(user);
}));

// ── Update Profile ────────────────────────────────────────────────────────────
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { name, email, phone, address, password, avatar } = req.body;
  if (name)    user.name    = name;
  if (email)   user.email   = email;
  if (phone)   user.phone   = phone;
  if (address) user.address = address;
  if (avatar)  user.avatar  = avatar;
  if (password) {
    if (password.length < 6) return res.status(400).json({ message: 'Password min 6 chars' });
    user.password = password;
  }
  const updated = await user.save();
  res.json(sanitize(updated));
}));

// ── Register as Seller ────────────────────────────────────────────────────────
router.post('/become-seller', protect, asyncHandler(async (req, res) => {
  const { storeName, description } = req.body;
  if (!storeName) return res.status(400).json({ message: 'Store name required' });

  const user = await User.findById(req.user._id);
  if (user.role === 'admin') return res.status(400).json({ message: 'Admins cannot become sellers' });

  user.role = 'seller';
  user.sellerInfo = { storeName, description, approved: false, totalSales: 0 };
  await user.save();
  res.json({ message: 'Seller application submitted. Pending admin approval.', user: sanitize(user) });
}));

// ── Wishlist toggle ───────────────────────────────────────────────────────────
router.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const pid  = req.params.productId;
  const idx  = user.wishlist.indexOf(pid);
  if (idx === -1) user.wishlist.push(pid);
  else            user.wishlist.splice(idx, 1);
  await user.save();
  res.json({ wishlist: user.wishlist, added: idx === -1 });
}));

// ── Notifications ─────────────────────────────────────────────────────────────
router.get('/notifications', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notifications');
  res.json(user.notifications || []);
}));

router.put('/notifications/read', protect, asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { $set: { 'notifications.$[].read': true } });
  res.json({ message: 'All marked as read' });
}));

// ── Log search history (for AI recommendations) ───────────────────────────────
router.post('/track-search', protect, asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: 'Query required' });
  await User.findByIdAndUpdate(req.user._id, {
    $push: { searchHistory: { $each: [query], $slice: -50 } },
  });
  res.json({ ok: true });
}));

// ── Forgot password ───────────────────────────────────────────────────────────
router.post('/forgot-password', authLimiter, asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).json({ message: 'No account with that email' });

  const token = crypto.randomBytes(20).toString('hex');
  user.resetToken  = crypto.createHash('sha256').update(token).digest('hex');
  user.resetExpire = Date.now() + 60 * 60 * 1000;
  await user.save();

  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
  await sendPasswordReset({ to: user.email, name: user.name, resetUrl: url });
  res.json({ message: 'Reset link sent to your email' });
}));

// ── Reset password ────────────────────────────────────────────────────────────
router.put('/reset-password/:token', asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user   = await User.findOne({ resetToken: hashed, resetExpire: { $gt: Date.now() } });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

  user.password    = req.body.password;
  user.resetToken  = undefined;
  user.resetExpire = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
}));

module.exports = router;


// ── PUT /api/auth/change-password ─────────────────────────────────────────────
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });

  const user = await User.findById(req.user._id).select('+password');
  if (user.password) {
    const ok = await user.matchPassword(currentPassword);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
  }
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated successfully' });
}));

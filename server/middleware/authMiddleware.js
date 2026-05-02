// server/middleware/authMiddleware.js  ← REPLACE existing file
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── protectRoute: verify JWT, attach req.user ─────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  // Check Authorization header (Bearer token)
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // Fallback: check httpOnly cookie (if you use cookie-based auth)
  else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    if (!req.user.isActive) {
      return res.status(401).json({ message: 'Account deactivated. Contact support.' });
    }

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired — please log in again', expired: true });
    }
    return res.status(401).json({ message: 'Token invalid' });
  }
};

// ── adminOnly: must be admin role ────────────────────────────────────────────
const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// ── sellerOrAdmin: approved seller OR admin ───────────────────────────────────
const seller = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  if (req.user?.role === 'seller' && req.user.sellerInfo?.approved) return next();
  res.status(403).json({ message: 'Approved seller access required' });
};

// ── generateToken ─────────────────────────────────────────────────────────────
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });

module.exports = { protect, admin, seller, generateToken };

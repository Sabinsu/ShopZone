// server/middleware/authMiddleware.js  ← REPLACE existing file
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// Protect: verify JWT and attach req.user
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer '))
    token = req.headers.authorization.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user || !req.user.isActive)
      return res.status(401).json({ message: 'User not found or deactivated' });
    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Admin only
const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

// Seller or Admin
const seller = (req, res, next) => {
  if (req.user?.role === 'seller' && req.user.sellerInfo?.approved) return next();
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Approved seller access required' });
};

// Generate JWT
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

module.exports = { protect, admin, seller, generateToken };

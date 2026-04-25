// server/middleware/rateLimiter.js  ← NEW FILE
const rateLimit = require('express-rate-limit');

// General API limiter
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts. Try again in 15 minutes.' },
});

// AI chat limiter (cost-sensitive)
exports.aiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 min
  max: 10,
  message: { message: 'AI rate limit reached. Please wait a moment.' },
});

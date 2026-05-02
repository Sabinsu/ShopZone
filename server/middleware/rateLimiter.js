// server/middleware/rateLimiter.js  ← REPLACE existing file
const rateLimit = require('express-rate-limit');

// General API limiter: 100 requests per 15 minutes
const apiLimiter = rateLimit({
  windowMs:    15 * 60 * 1000,
  max:         100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: 'Too many requests, please try again later.' },
});

// Strict auth limiter: 10 requests per 15 minutes (prevents brute force)
const authLimiter = rateLimit({
  windowMs:    15 * 60 * 1000,
  max:         10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { message: 'Too many login attempts. Please wait 15 minutes.' },
});

// Upload limiter: 20 uploads per hour
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      20,
  message:  { message: 'Upload limit reached. Try again in an hour.' },
});

module.exports = { apiLimiter, authLimiter, uploadLimiter };

const rateLimit = require('express-rate-limit');

const isDev = process.env.NODE_ENV !== 'production';

// Rate Limiting for Auth Endpoints (Login/Register/Refresh)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 10000 : 500, // 10000 in dev, 500 in prod per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true
});

// General API Rate Limiting for overall backend endpoints
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 50000 : 5000, // 50000 in dev, 5000 in prod per windowMs
  message: {
    success: false,
    message: 'Too many API requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => true
});

module.exports = {
  authLimiter,
  apiLimiter
};

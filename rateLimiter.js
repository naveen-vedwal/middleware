// Rate Limiting setup using express-rate-limit to avoid overload
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  limit: 100, // Maximum requests allowed per minute
  message: 'Too many requests, please try again later',
});

module.exports = limiter;

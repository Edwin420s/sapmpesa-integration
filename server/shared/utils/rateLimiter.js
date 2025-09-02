const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: message || 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

// Different rate limits for different types of requests
const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter(15 * 60 * 1000, 5, 'Too many login attempts, please try again after 15 minutes.'),
  
  // Moderate limit for API endpoints
  api: createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests, please try again later.'),
  
  // Higher limit for payment endpoints (more business critical)
  payments: createRateLimiter(15 * 60 * 1000, 30, 'Too many payment requests, please try again later.'),
  
  // Very strict limit for password reset
  passwordReset: createRateLimiter(60 * 60 * 1000, 3, 'Too many password reset attempts, please try again after 1 hour.')
};

const getRateLimiter = (type = 'api') => {
  return rateLimiters[type] || rateLimiters.api;
};

// IP-based rate limiting with Redis store (for production)
const createRedisRateLimiter = (redisClient) => {
  const RedisStore = require('rate-limit-redis');
  
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }),
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  });
};

module.exports = {
  createRateLimiter,
  getRateLimiter,
  createRedisRateLimiter,
  rateLimiters
};
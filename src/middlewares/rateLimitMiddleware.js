const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 100, // 15 minutes
    max: 100,
    message: 'Too many requests, please try again.'
})

module.exports = limiter;

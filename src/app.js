const express = require('express');
const bodyParser = require('body-parser');
const corsMiddleware = require('./middlewares/corsMiddleware');
const rateLimitMiddleware = require('./middlewares/rateLimitMiddleware');
const { verifyToken, verifyHMACSignature, verifyMerchant } = require('./middlewares/authMiddleware');
const errorHandler = require('./middlewares/errorHandler');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(corsMiddleware);
app.use(bodyParser.json());
app.use(rateLimitMiddleware);

// Log every request
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Apply middleware to secure payment endpoints
app.use('/api/payments', paymentRoutes);

// Global error handling middleware
app.use(errorHandler);

module.exports = app;
const pool = require('../config/db');
const crypto = require('crypto');
const { getMerchantByApiKey } = require('../models/merchant');

// Attach merchant info to `req.merchant`
const verifyMerchant = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'Missing API key' });
    }

    try {
        const result = await pool.query(
            'SELECT id, secret, is_superuser FROM merchants WHERE api_key = $1',
            [apiKey]
        );
        const merchant = await getMerchantByApiKey(apiKey);

        if (!merchant) {
            return res.status(403).json({ message: 'Invalid API key' });
        }

        req.merchant = result.rows[0]; // Make merchant info available to downstream routes
        
        next();
    } catch (err) {
        console.error('verifyMerchant error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const verifyHMACSignature = (req, res, next) => {
    const payload = JSON.stringify(req.body);
    const receivedSignature = req.headers['x-hmac-signature'];

    if (!receivedSignature || !req.merchant?.secret) {
        return res.status(403).json({ message: 'Missing signature or merchant secret' });
    }

    const expectedSignature = crypto
        .createHmac('sha256', req.merchant.secret)
        .update(payload)
        .digest('hex');

    if (receivedSignature !== expectedSignature) {
        return res.status(403).json({ message: 'Invalid Signature' });
    }

    next();
};

// Optional: check if the merchant is a superuser
const verifySuperUser = (req, res, next) => {
    if (!req.merchant?.is_superuser) {
        return res.status(403).json({ message: 'Superuser access required' });
    }
    next();
};

module.exports = {
    verifyMerchant,
    verifyHMACSignature,
    verifySuperUser
};
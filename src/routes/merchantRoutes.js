const express = require('express');
const pool = require('../config/db');
const verifyMerchant = require('../middlewares/authMiddleware');

const router = express.Router();

// Update webhook URL
router.post('/webhook', verifyMerchant, async (req, res) => {
    const { webhookUrl } = req.body;
    const apiKey = req.headers['x-api-key'];

    try {
        await pool.query(
            `UPDATE merchants SET webhook_url = $1 WHERE api_key = $2`,
            [webhookUrl, apiKey]
        );

        res.json({ message: 'Webhook URL updated' });
    } catch (err) {
        console.error('Update webhook error:', err);
        res.status(500).json({ message: 'Could not update webhook' });
    }
});

// Get merchant profile
router.get('/profile', verifyMerchant, async (req, res) => {
    const apiKey = req.headers['x-api-key'];

    try {
        const { rows } = await pool.query(
            `SELECT name, email, plan, webhook_url FROM merchants WHERE api_key = $1`,
            [apiKey]
        );

        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
});

module.exports = router;
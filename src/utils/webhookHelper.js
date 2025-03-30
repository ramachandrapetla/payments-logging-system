const crypto = require('crypto');
const axios = require('axios');
const pool = require('../config/db');

async function sendWebhookNotification(webhookUrl, payload, secret, merchantId) {
    const signature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');

    try {
        const response = await axios.post(webhookUrl, payload, {
            headers: {
                'x-hmac-signature': signature,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        await pool.query(
            `INSERT INTO webhook_logs (merchant_id, transaction_id, webhook_url, payload, response_status, response_body, success)
             VALUES ($1, $2, $3, $4, $5, $6, true)`,
            [merchantId, payload.transactionId, webhookUrl, payload, response.status, JSON.stringify(response.data)]
        );

    } catch (err) {
        console.error('Webhook failed:', err.message);

        await pool.query(
            `INSERT INTO webhook_logs (merchant_id, transaction_id, webhook_url, payload, response_status, response_body, success)
             VALUES ($1, $2, $3, $4, $5, $6, false)`,
            [
                merchantId,
                payload.transactionId,
                webhookUrl,
                payload,
                err.response?.status || 500,
                JSON.stringify(err.response?.data || err.message)
            ]
        );
    }
}

module.exports = { sendWebhookNotification };
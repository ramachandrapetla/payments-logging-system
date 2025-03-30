const { v4: uuidv4 } = require('uuid');
const { sendWebhookNotification } = require('../utils/webhookHelper');
const { createTransaction, updateTransactionStatus, getTransaction } = require('../models/transaction');
const { getMerchantByApiKey } = require('../models/merchant');
const logger = require('../utils/logger')

const initiatePayment = async (req, res) => {
    const { amount, currency, orderId } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!amount || !currency || !orderId) {
        return res.status(400).json({ message: 'amount, currency, and orderId are required' });
    }

    try {
        const merchant = await getMerchantByApiKey(apiKey);

        if (!merchant) {
            return res.status(403).json({ message: 'Invalid API key' });
        }

        const merchantId = merchant.id;
        const transactionId = uuidv4();
        const status = 'initiated';

        const transaction = await createTransaction(
            transactionId,
            merchantId,
            orderId,
            amount,
            currency,
            status
        );
        
        res.status(200).json({
            message: 'Payment initiated',
            transactionId: transaction.transaction_id,
            status: transaction.status
        });

    } catch (err) {
        console.error('initiatePayment error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const confirmPayment = async (req, res) => {
    const { transactionId } = req.body;
    const apiKey = req.headers['x-api-key'];

    if (!transactionId) {
        return res.status(400).json({ message: 'transactionId is required' });
    }

    try {
        const merchant = await getMerchantByApiKey(apiKey);

        if (!merchant) {
            return res.status(403).json({ message: 'Invalid API key' });
        }

        const tx = await updateTransactionStatus(transactionId, merchant.id, 'success');

        if (!tx) {
            return res.status(404).json({ message: 'Transaction not found or unauthorized' });
        }

        const payload = {
            transactionId,
            amount: tx.amount,
            currency: tx.currency,
            orderId: tx.order_id,
            status: 'success',
            timestamp: tx.created_at
        };

        if (merchant.webhook_url) {
            await sendWebhookNotification(merchant.webhook_url, payload, merchant.secret);
        }

        res.status(200).json({
            message: 'Payment confirmed',
            transaction: { transactionId, ...payload }
        });

    } catch (err) {
        console.error('confirmPayment error:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const getPayment = async (req, res) => {
    const { id: transactionId } = req.params;
    const apiKey = req.headers['x-api-key'];

    try {
        const merchant = await getMerchantByApiKey(apiKey);

        const merchantId = merchant.id;

        const tx = await getTransaction(transactionId, merchantId);

        if (!tx) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.status(200).json(tx);

    } catch (err) {
        logger.error(`getPayment error:, ${err}`);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    initiatePayment,
    confirmPayment,
    getPayment
};
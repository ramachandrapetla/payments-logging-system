const pool = require('../config/db');

const createTransaction = async (transactionId, merchantId, orderId, amount, currency, status) => {
    const query = `
        INSERT INTO transactions (transaction_id, merchant_id, order_id, amount, currency, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING transaction_id, status;
    `;
    const values = [transactionId, merchantId, orderId, amount, currency, status];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const updateTransactionStatus = async (transactionId, merchantId, newStatus) => {
    const query = `
        UPDATE transactions
        SET status = $1
        WHERE transaction_id = $2 AND merchant_id = $3
        RETURNING amount, currency, order_id, created_at;
    `;
    const values = [newStatus, transactionId, merchantId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

const getTransaction = async (transactionId, merchantId) => {
    const query = `
        SELECT transaction_id, order_id, amount, currency, status, created_at
        FROM transactions
        WHERE transaction_id = $1 AND merchant_id = $2;
    `;
    const values = [transactionId, merchantId];
    const result = await pool.query(query, values);
    return result.rows[0];
};

module.exports = {
    createTransaction,
    updateTransactionStatus,
    getTransaction
};
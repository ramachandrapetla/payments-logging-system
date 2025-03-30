const pool = require('../config/db');

const getMerchantByApiKey = async (apiKey) => {
    const result = await pool.query(
        'SELECT id, secret, is_superuser, webhook_url FROM merchants WHERE api_key = $1',
        [apiKey]
    );
    return result.rows[0]; // undefined if not found
};

const createMerchant = async ({ name, email, apiKey, secret, plan = 'free', isSuperUser = false }) => {
    const result = await pool.query(
        `INSERT INTO merchants (name, email, api_key, secret, plan, is_superuser)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [name, email, apiKey, secret, plan, isSuperUser]
    );
    return result.rows[0];
};

module.exports = {
    getMerchantByApiKey,
    createMerchant
};
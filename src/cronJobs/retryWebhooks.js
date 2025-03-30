const pool = require('../config/db');
const { sendWebhookNotification } = require('../utils/webhookHelper');

const retryFailedWebhooks = async () => {
    const { rows } = await pool.query(
        `SELECT * FROM webhook_logs
         WHERE success = false AND retry_count < 3
         ORDER BY attempt_time ASC
         LIMIT 10`
    );

    for (const log of rows) {
        logger.info(`Retrying webhook: ${log.id}`);
        try {
            await sendWebhookNotification(log.webhook_url, log.payload, null, log.merchant_id);

            await pool.query(
                `UPDATE webhook_logs SET retry_count = retry_count + 1 WHERE id = $1`,
                [log.id]
            );
        } catch (err) {
            await pool.query(
                `UPDATE webhook_logs SET retry_count = retry_count + 1 WHERE id = $1`,
                [log.id]
            );
        }
    }
}

module.exports = retryFailedWebhooks;
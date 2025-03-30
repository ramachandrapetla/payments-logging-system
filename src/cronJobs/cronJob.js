const cron = require('node-cron');
const retryFailedWebhooks = require('./retryWebhooks');

cron.schedule('*/5 * * * *', async () => {
    try {
        console.log(`[Cron] Running webhook retry at ${new Date().toISOString()}`);
        await retryFailedWebhooks();
        console.log(`[Cron] Retry complete\n`);
    } catch (err) {
        console.error(`[Cron] Error during webhook retry:`, err);
    }
});
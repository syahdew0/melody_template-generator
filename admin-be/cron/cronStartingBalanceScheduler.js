const cron = require('node-cron');
const { updateStartingBalanceAll } = require('../cron/cronStartingBalance');

// Schedule cron: setiap hari jam 00:00:00
cron.schedule('0 0 * * *', async () => {
  console.log(`[${new Date().toLocaleString()}] Running starting balance update...`);
  try {
    await updateStartingBalanceAll();
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] Error in cron:`, err);
  }
}, {
  timezone: 'Asia/Jakarta' // gunakan timezone server
});

console.log('Cron job for starting balance scheduled (00:00 every day)');

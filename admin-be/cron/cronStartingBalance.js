const { User, WalletHistory, StartingBalance } = require('../models');
const { Op } = require('sequelize');

async function updateStartingBalance() {
  try {
    const users = await User.findAll({ attributes: ['username'], raw: true });
    const walletTypes = await WalletHistory.findAll({
      attributes: ['wallet_type_id'],
      group: ['wallet_type_id'],
      raw: true,
      where: { wallet_type_id: { [Op.ne]: null } },
    });

    for (const user of users) {
      for (const walletType of walletTypes) {
        const username = user.username;
        const walletTypeId = walletType.wallet_type_id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Hitung total semua transaksi sukses sebelum hari ini
        const balance = await WalletHistory.sum('amount', {
          where: {
            username,
            wallet_type_id: walletTypeId,
            status: 'success',
            created_at: { [Op.lt]: todayStart } // sebelum jam 00:00 hari ini
          }
        }) || 0;

        // findOrCreate untuk hari ini
        const [starting, created] = await StartingBalance.findOrCreate({
          where: {
            username,
            wallet_type_id: walletTypeId,
            date: { [Op.between]: [todayStart, todayEnd] }
          },
          defaults: { balance, date: todayStart }
        });

        if (!created) {
          starting.balance = balance;
          starting.date = todayStart; // paksa jam 00:00
          await starting.save();
        }
      }
    }

    console.log(`[${new Date().toLocaleString()}] Starting balance updated for all users`);
  } catch (err) {
    console.error(`[${new Date().toLocaleString()}] Error updating starting balance:`, err);
  }
}

updateStartingBalance();

module.exports = { updateStartingBalance };

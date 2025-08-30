const { User, WalletHistory, StartingBalance, sequelize } = require('../models');
const { Op } = require('sequelize');

//Fungsi untuk menyimpan/men-update starting balance semua user + wallet type
async function updateStartingBalanceAll() {
  try {
    // 1. Ambil semua user
    const users = await User.findAll({ attributes: ['username'], raw: true });

    // 2. Ambil semua wallet_type unik dari WalletHistory
    const walletTypes = await WalletHistory.findAll({
      attributes: ['wallet_type_id'],
      group: ['wallet_type_id'],
      raw: true,
      where: {
            wallet_type_id: { [Op.ne]: null } 
        },
    });

    // 3. Loop semua kombinasi user + wallet type
    for (const user of users) {
      for (const walletType of walletTypes) {
        const username = user.username;
        const walletTypeId = walletType.wallet_type_id;

        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        // Ambil saldo terakhir WalletHistory
        const lastHistory = await WalletHistory.findOne({
          where: { username, wallet_type_id: walletTypeId },
          order: [['created_at', 'DESC']],
          
          raw: true
        });

        const balance = lastHistory?.balance_after || 0;

        // findOrCreate untuk hari ini
        const [starting, created] = await StartingBalance.findOrCreate({
          where: {
            username,
            wallet_type_id: walletTypeId,
            date: { [Op.between]: [todayStart, todayEnd] }
          },
          defaults: {
            balance,
            date: new Date()
          }
        });

        // update jika sudah ada
        if (!created) {
          starting.balance = balance;
          starting.date = new Date();
          await starting.save();
        }
      }
    }

    console.log(' Starting balance updated for all users');
  } catch (err) {
    console.error(' Error updating starting balance:', err);
  }
}

module.exports = { updateStartingBalanceAll };

// Jika dijalankan langsung dari node
if (require.main === module) {
  updateStartingBalanceAll().then(() => process.exit(0));
}

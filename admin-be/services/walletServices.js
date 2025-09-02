const { WalletHistory, StartingBalance } = require('../models');
const { Op } = require('sequelize');

// Ambil saldo terbaru
async function getWallet(username, walletTypeId) {
  const starting = await StartingBalance.findOne({
    where: { username, wallet_type_id: walletTypeId },
    order: [['date', 'DESC']],
    raw: true
  });

  const startingBalance = starting?.balance || 0;
  const startingDate = starting?.date || new Date(0);

  // Sum semua transaksi, termasuk failed/canceled
  const totalUpdate = await WalletHistory.sum('amount', {
    where: {
      username,
      wallet_type_id: walletTypeId,
      created_at: { [Op.gt]: startingDate } // semua transaksi setelah starting
    }
  }) || 0;

  return parseFloat(startingBalance) + parseFloat(totalUpdate);
}

// Update atau buat starting balance 
async function updateStartingBalance(username, walletTypeId) {
  if (!username) throw new Error("Username harus diisi");
  if (!walletTypeId) throw new Error("walletTypeId harus diisi");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

    // Hitung total semua transaksi wallet
  const total = await WalletHistory.sum('amount', {
    where: { username, wallet_type_id: walletTypeId, HistoryDate: { [Op.lt]:todayStart } }
  }) || 0;

  // Cari starting balance hari ini
  let starting = await StartingBalance.findOne({
    where: {
      username,
      wallet_type_id: walletTypeId,
      date: { [Op.between]: [todayStart, todayEnd] },
    }
  });
      console.log('todayStart');
  if (!starting) {
    // Buat baru
    starting = await StartingBalance.create({
      username,
      wallet_type_id: walletTypeId,
      balance: total,
      date: todayStart
    });
  } else {
    // Update saldo
    starting.balance = total;
    starting.date = todayStart
    await starting.save();

  }

  return starting;
}


// Simpan transaksi wallet
async function updateWalletBalance({ username, walletTypeId, amount, transactionTypeId, referenceId = null, remarks = null, createdBy = null }) {
  const history = await WalletHistory.create({
    username,
    wallet_type_id: walletTypeId,
    transaction_type_id: transactionTypeId,
    reference_id: referenceId,
    // balance_before: null,
    amount,
    // balance_after: null,  
    remarks,
    createdby: createdBy,
    created_at: new Date()
  });

  return history;
}

module.exports = { getWallet, updateWalletBalance, updateStartingBalance };
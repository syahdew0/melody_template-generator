const { WalletHistory, StartingBalance, sequelize } = require('../models');
const { Op } = require('sequelize');

//Ambil saldo berdasarkan username & wallet_type_id
async function getWallet(username, walletTypeId) {
  const totalSuccess = await WalletHistory.sum('amount', {
    where: {
      username,
      wallet_type_id: walletTypeId,
      status: 'success',
    },
  }) || 0;

  const totalPendingWithdraw = await WalletHistory.sum('amount', {
    where: {
      username,
      wallet_type_id: walletTypeId,
      status: 'pending',
      amount: { [Op.lt]: 0 },
    },
  }) || 0;

  return {
    username,
    wallet_type_id: walletTypeId,
    balance: Number(totalSuccess + totalPendingWithdraw),
    balance_source: 'wallet_histories'
  };
}

//Tambah / kurangi saldo user
async function updateWalletBalance({
  username,
  walletTypeId,
  amount,
  transactionTypeId,
  referenceId = null,
  remarks = null,
  status = 'success',
  createdBy = null
}) {
  const lastHistory = await WalletHistory.findOne({
    where: { username, wallet_type_id: walletTypeId },
    order: [['created_at', 'DESC']],
    raw: true
  });

  const balanceBefore = lastHistory?.balance_after || 0;
  const balanceAfter = balanceBefore + amount;

  if (balanceAfter < 0) throw new Error('Saldo tidak cukup');

  const history = await WalletHistory.create({
    username,
    wallet_type_id: walletTypeId,
    transaction_type_id: transactionTypeId,
    reference_id: referenceId,
    balance_before: balanceBefore,
    amount,
    balance_after: balanceAfter,
    remarks,
    status,
    createdby: createdBy,
    created_at: new Date()
  });

  return history;
}

async function startingBalance(username, walletTypeId) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // Ambil saldo terakhir dari WalletHistory
  const lastHistory = await WalletHistory.findOne({
    where: { username, wallet_type_id: walletTypeId },
    order: [['created_at', 'DESC']],
    raw: true
  });

  const balance = lastHistory?.balance_after || 0;

  // Cek dulu apakah sudah ada starting balance hari ini
  const [starting, created] = await StartingBalance.findOrCreate({
    where: {
      username,
      wallet_type_id: walletTypeId,
      date: {
        [Op.between]: [todayStart, todayEnd]
      }
    },
    defaults: {
      balance,
      date: new Date()
    }
  });

  // kalo udah ada, update balance
  if (!created) {
    starting.balance = balance;
    starting.date = new Date();
    await starting.save();
  }

  return starting;
}


module.exports = { getWallet, updateWalletBalance, startingBalance };

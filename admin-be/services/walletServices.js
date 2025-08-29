// services/walletService.js
const { Wallet, WalletHistory, Adjust, sequelize } = require('../models');
const { Op } = require('sequelize');


async function getWallet(customerId, walletType, username = null) {
  // cari wallet utama
  const wallet = await Wallet.findOne({
    where: { customer_id: customerId, wallet_type: walletType },
  });

  // hitung total dari history sukses 
const totalHistory = await WalletHistory.sum('amount', {
  where: {
    walletId: wallet?.id,
    [Op.or]: [
      { status: 'success' }, // semua transaksi sukses
      { status: 'pending', transaction_type_id: 2 } // hanya pending withdraw 
    ]
  }
}) || 0;

  return {
    id: wallet?.id || null,
    customer_id: customerId,
    wallet_type: walletType,
    balance: totalHistory,
    balance_source: 'history_sum'
  };
}

//  Update saldo user dan catat ke WalletHistory
async function updateWalletBalance({ customerId, walletType, username, amount, transactionTypeId, referenceId, remarks, status = 'success' }) {
  // cari atau buat wallet
  let wallet = await Wallet.findOne({ where: { customer_id: customerId, wallet_type: walletType } });
  if (!wallet) {
    wallet = await Wallet.create({ customer_id: customerId, wallet_type: walletType, balance: 0, username });
  }

  const balanceBefore = wallet.balance;
let balanceAfter = balanceBefore + amount;
if (balanceAfter < 0) throw new Error('Saldo tidak cukup');

// update saldo walaupun status pending
wallet.balance = balanceAfter;

await sequelize.transaction(async (t) => {
  await wallet.save({ transaction: t });

  await WalletHistory.create({
    walletId: wallet.id,
    username,
    wallet_type: wallet.wallet_type,
    transaction_type_id: transactionTypeId,
    reference_id: referenceId,
    balance_before: balanceBefore,
    amount,
    balance_after: balanceAfter,
    remarks,
    status
  }, { transaction: t });
});

  return wallet;
}


module.exports = { getWallet, updateWalletBalance };

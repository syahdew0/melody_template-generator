// services/walletService.js
const { Wallet, WalletHistory } = require('../models');
const { Op } = require('sequelize');

async function getSaldo(userId, walletType) {
  const wallet = await Wallet.findOne({
    where: { customer_id: userId, wallet_type: walletType },
    raw: true,
  });
  if (!wallet) return 0;

  const latestHistory = await WalletHistory.findOne({
    where: { walletId: wallet.id, status: 'success' },
    order: [['created_at', 'DESC']],
    attributes: ['balance_after'],
    raw: true,
  });

  return latestHistory?.balance_after || 0;
}

async function getSaldoAll(userId) {
  const wallets = await Wallet.findAll({
    where: { customer_id: userId },
    attributes: ['wallet_type'],
    raw: true,
  });

  let total = 0;
  for (const w of wallets) {
    total += await getSaldo(userId, w.wallet_type);
  }
  return total;
}

module.exports = { getSaldo, getSaldoAll };

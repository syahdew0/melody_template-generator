const { Wallet, WalletHistory, WalletSummary } = require('../../models');

async function processWalletTransaction({ username, amount, referenceid, type, remarks }) {
  const wallet = await Wallet.findOne({ where: { username } });
  if (!wallet) throw new Error('Wallet tidak ditemukan');

  const today = new Date().toISOString().split('T')[0];

  // Update summary
  const transaction_type_id = type === 'in' ? 1 : 2; // 1: topup, 2: withdraw
  const [summary, created] = await WalletSummary.findOrCreate({
    where: {
      walletid: wallet.id,
      username,
      transaction_type_id,
      summarydate: today,
    },
    defaults: {
      amount: amount
    }
  });

  if (!created) {
    summary.amount += parseFloat(amount);
    await summary.save();
  }

  // Create wallet history
  await WalletHistory.create({
    walletid: wallet.id,
    username,
    type, // 'in' or 'out'
    amount,
    referenceid,
    remarks,
    createdon: new Date()
  });

  // Update balance
  if (type === 'in') {
    wallet.balance += parseFloat(amount);
  } else if (type === 'out') {
    if (wallet.balance < amount) {
      throw new Error('Saldo tidak cukup');
    }
    wallet.balance -= parseFloat(amount);
  }

  await wallet.save();
}
module.exports = { processWalletTransaction };

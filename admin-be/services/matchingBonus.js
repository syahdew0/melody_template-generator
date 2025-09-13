const { Customer, MlmUserWallet, WalletHistory, MLMPackage, MLMPackageMatching } = require('../models');

async function giveMatchingBonus({ downline, packageValue, packageId, transaction }) {
  let uplineId = downline.referral;
  let level = 1;

  while (uplineId) {
    const upline = await Customer.findByPk(uplineId, { transaction });
    if (!upline) break;

    const uplineWallet = await MlmUserWallet.findOne({
      where: { customer_id: upline.id, wallet_type_id: 1 },
      transaction
    });
    if (!uplineWallet) break;

    const matching = await MLMPackageMatching.findOne({
      where: { MLMPackageID: packageId, Level: level },
      transaction
    });
    const levelPercent = matching ? parseFloat(matching.Percentage) : 0;
    if (levelPercent <= 0) break;

    const bonusAmount = packageValue * levelPercent;

const lastHistory = await WalletHistory.findOne({
  where: { username: upline.username, wallet_type_id: 1 },
  order: [['id', 'DESC']],
  transaction
});
const balanceBefore = lastHistory ? lastHistory.balance_after : 0;


    const balanceAfter = balanceBefore + bonusAmount;

    // update saldo wallet upline
    await uplineWallet.update({ balance: balanceAfter }, { transaction });

    // catat hanya untuk upline
await WalletHistory.create({
  username: upline.username,
  transaction_type_id: 16, // matching bonus
  wallet_type_id: 1,
  reference_id: downline.id,  // <-- isi dengan ID downline
  amount: bonusAmount,
  balance_before: balanceBefore,
  balance_after: balanceAfter,
  remarks: `Matching bonus level ${level} dari downline ${downline.username}`,
  status: 'success'
}, { transaction });


    uplineId = upline.referral;
    level++;
  }
}

module.exports = { giveMatchingBonus };

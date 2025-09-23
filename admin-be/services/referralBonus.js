const { Customer, MlmUserWallet, WalletHistory, MLMPackage } = require('../models');

async function giveReferralBonus({ newUserId, packageValue, packageId, transaction }) {
  const newUser = await Customer.findByPk(newUserId, { transaction });
  if (!newUser) return;

  const uplineId = newUser.referral;
  if (!uplineId) return;

  const mlmPackage = await MLMPackage.findByPk(packageId, { transaction });
  if (!mlmPackage) return;

  const bonusPercent = parseFloat(mlmPackage.ReferralBonus || 0);
  if (bonusPercent <= 0) return;

  const bonusAmount = packageValue * (bonusPercent / 100);

  const upline = await Customer.findByPk(uplineId, { transaction });
  if (!upline) return;

  const uplineWallet = await MlmUserWallet.findOne({
    where: { customer_id: uplineId, wallet_type_id: 1 },
    transaction
  });
  if (!uplineWallet) return;

  const lastHistory = await WalletHistory.findOne({
    where: { username: upline.username, wallet_type_id: 1 },
    order: [['id', 'DESC']],
    transaction
  });
  const balanceBefore = lastHistory ? lastHistory.balance_after : 0;
  const balanceAfter = balanceBefore + bonusAmount;

  await uplineWallet.update({ balance: balanceAfter }, { transaction });

  await WalletHistory.create({
    username: upline.username,
    transaction_type_id: 15, // referral bonus
    wallet_type_id: 1,
    reference_id: newUser.id,
    amount: bonusAmount,
    balance_before: balanceBefore,
    balance_after: balanceAfter,
    remarks: `Referral bonus dari ${newUser.username}`,
    status: 'success'
  }, { transaction });
}


module.exports = { giveReferralBonus };

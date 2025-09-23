// services/matchingBonus.js
const { Customer, MlmUserWallet, WalletHistory, MLMPackageMatching, MlmRegistration, MLMSetting, MLMPackage, sequelize } = require('../models');

async function giveMatchingBonus({ newUserId, packageId, packageValue, transaction }) {
  // Ambil pengaturan MLM
  const setting = await MLMSetting.findOne({ transaction });
  const bonusSource = setting?.BonusSource || 'downline'; // default downline

  // Ambil registrasi MLM downline baru
  let currentReg = await MlmRegistration.findOne({
    where: { customer_id: newUserId },
    transaction
  });
  if (!currentReg) return;

  const downline = await Customer.findByPk(newUserId, { transaction });
  if (!downline) return;

  let level = 0;

  // Loop naik ke upline
  while (currentReg && currentReg.upline_id) {
    level++;

    let uplineReg = await MlmRegistration.findOne({
      where: { customer_id: currentReg.upline_id },
      transaction
    });
    if (!uplineReg) break;

    // Ambil aturan matching bonus sesuai pengaturan bonusSource
    let matchingRules;
    let bonusPackageValue = packageValue; // default pakai packageValue downline
    if (bonusSource === 'upline') {
      // Ambil aturan dari paket upline
      matchingRules = await MLMPackageMatching.findAll({
        where: { MLMPackageID: uplineReg.mlm_package_id },
        order: [['Level', 'ASC']],
        transaction
      });
      // Ambil value paket upline
      const uplinePkg = await MLMPackage.findByPk(uplineReg.mlm_package_id, { transaction });
      if (uplinePkg) bonusPackageValue = parseFloat(uplinePkg.PackageValue || 0);
    } else { // downline
      matchingRules = await MLMPackageMatching.findAll({
        where: { MLMPackageID: packageId },
        order: [['Level', 'ASC']],
        transaction
      });
    }

    const rule = matchingRules.find(r => r.Level === level);
    if (!rule) break;

    // Ambil data upline
    const upline = await Customer.findByPk(uplineReg.customer_id, { transaction });
    if (!upline) break;

    const bonusAmount = (bonusPackageValue * rule.Percentage) / 100;

    // Ambil wallet upline, buat jika belum ada
    let uplineWallet = await MlmUserWallet.findOne({
      where: { customer_id: upline.id, wallet_type_id: 1 },
      transaction
    });
    if (!uplineWallet) {
      uplineWallet = await MlmUserWallet.create({ customer_id: upline.id, wallet_type_id: 1, balance: 0 }, { transaction });
    }

    const lastHistory = await WalletHistory.findOne({
      where: { username: upline.username, wallet_type_id: 1 },
      order: [['id', 'DESC']],
      transaction
    });
    const balanceBefore = lastHistory ? lastHistory.balance_after : 0;
    const balanceAfter = balanceBefore + bonusAmount;

    // Update wallet dan simpan history
    await uplineWallet.update({ balance: balanceAfter }, { transaction });
    await WalletHistory.create({
      username: upline.username,
      transaction_type_id: 16,
      wallet_type_id: 1,
      reference_id: newUserId,
      amount: bonusAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      remarks: `Matching bonus level ${level} dari ${downline.username} `,
      status: 'success'
    }, { transaction });

    console.log(`Level ${level} - ${upline.username} dapat ${bonusAmount} dari ${downline.username} (${bonusSource})`);

    currentReg = uplineReg; // naik ke level atas
  }
}

module.exports = { giveMatchingBonus };

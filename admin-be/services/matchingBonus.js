const { Customer, MlmUserWallet, WalletHistory, MLMPackageMatching, MlmRegistration } = require('../models');

async function giveMatchingBonus({ newUserId, packageId, packageValue, transaction }) {
  // Ambil semua aturan matching bonus untuk paket ini, urut dari level 1
  const matchingRules = await MLMPackageMatching.findAll({
    where: { MLMPackageID: packageId },
    order: [['Level', 'ASC']],
    transaction
  });
  if (!matchingRules || matchingRules.length === 0) return;

  // Ambil registrasi MLM downline baru
  let currentReg = await MlmRegistration.findOne({
    where: { customer_id: newUserId },
    transaction
  });
  if (!currentReg) return;

  // Simpan data downline awal untuk remarks
  const downline = await Customer.findByPk(newUserId, { transaction });
  if (!downline) return;

  let level = 0;

  // Loop naik ke upline
  while (currentReg && currentReg.upline_id) {
    level++;

    const rule = matchingRules.find(r => r.Level === level);
    if (!rule) break; // level tidak ada aturan, stop

    const uplineReg = await MlmRegistration.findOne({
      where: { customer_id: currentReg.upline_id },
      transaction
    });
    if (!uplineReg) break;

    const upline = await Customer.findByPk(uplineReg.customer_id, { transaction });
    if (!upline) break;

    // Hitung bonus
    const bonusAmount = (packageValue * rule.Percentage) / 100;

    // Ambil wallet upline
    const uplineWallet = await MlmUserWallet.findOne({
      where: { customer_id: upline.id, wallet_type_id: 1 },
      transaction
    });
    if (!uplineWallet) break;

    const lastHistory = await WalletHistory.findOne({
      where: { username: upline.username, wallet_type_id: 1 },
      order: [['id', 'DESC']],
      transaction
    });
    const balanceBefore = lastHistory ? lastHistory.balance_after : 0;
    const balanceAfter = balanceBefore + bonusAmount;

    // Update saldo wallet upline
    await uplineWallet.update({ balance: balanceAfter }, { transaction });


    await WalletHistory.create({
      username: upline.username,
      transaction_type_id: 16, // matching bonus
      wallet_type_id: 1,
      reference_id: newUserId,
      amount: bonusAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      remarks: `Matching bonus level ${level} dari ${downline.username}`, 
      status: 'success'
    }, { transaction });

    console.log(`Level ${level} - ${upline.username} dapat matching bonus ${bonusAmount} dari ${downline.username}`);

    // Naik ke upline berikutnya
    currentReg = uplineReg;
  }
}

module.exports = { giveMatchingBonus };

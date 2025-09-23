// controllers/addDownline.js
const { Customer, MLMPackage, MlmRegistration, MlmUserWallet, WalletHistory, MLMSetting, sequelize } = require('../../models');
const bcrypt = require('bcryptjs');
const { giveReferralBonus } = require('../../services/referralBonus');
const { giveMatchingBonus } = require('../../services/matchingBonus');

exports.addDownline = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      username, email, password, mlm_package_id,
      bank, no_rekening, nama_rekening, no_hp,
      parentId, placement_pos
    } = req.body;

    const loginUser = req.customer;

    // Validasi parentId berdasarkan mlm_registrations
   const uplineReg = await MlmRegistration.findOne({
  where: { customer_id: parentId },
  transaction: t
});
if (!uplineReg) return res.status(400).json({ message: 'Parent MLM tidak ditemukan' });

    // Ambil data customer dari upline
    const uplineCustomer = await Customer.findByPk(uplineReg.customer_id, { transaction: t });

    // Validasi username unik
    const exist = await Customer.findOne({ where: { username }, transaction: t });
    if (exist) return res.status(400).json({ message: 'Username sudah terpakai' });

    // Validasi paket MLM
    const pkg = await MLMPackage.findByPk(mlm_package_id, { transaction: t });
    if (!pkg || pkg.IsSuspend) return res.status(400).json({ message: 'Paket MLM tidak valid' });

    const packageValue = parseFloat(pkg.PackageValue || 0);

    // Ambil saldo terakhir user login
    const lastHistory = await WalletHistory.findOne({
      where: { username: loginUser.username, wallet_type_id: 1 },
      order: [['id', 'DESC']],
      transaction: t
    });
    const currentBalance = lastHistory ? lastHistory.balance_after : 0;
    if (currentBalance < packageValue) return res.status(400).json({ message: 'Saldo tidak cukup untuk join paket' });

    // Ambil atau buat wallet user login
    let userWallet = await MlmUserWallet.findOne({ where: { customer_id: loginUser.id, wallet_type_id: 1 }, transaction: t });
    if (!userWallet) {
      userWallet = await MlmUserWallet.create({ customer_id: loginUser.id, wallet_type_id: 1, balance: currentBalance }, { transaction: t });
    }

    // Kurangi saldo user login
    const userAfter = currentBalance - packageValue;
    await userWallet.update({ balance: userAfter }, { transaction: t });

    await WalletHistory.create({
      customer_id: loginUser.id,
      username: loginUser.username,
      transaction_type_id: 14,
      wallet_type_id: 1,
      amount: -packageValue,
      balance_before: currentBalance,
      balance_after: userAfter,
      remarks: `Join MLM paket ${pkg.MLMPackageName || pkg.PackageName || 'paket'}`,
      status: 'success'
    }, { transaction: t });

    // Buat akun downline
    const hashed = await bcrypt.hash(password, 10);
    const newDownline = await Customer.create({
      username, email, password: hashed, bank, no_rekening, nama_rekening, no_hp, referral: loginUser.id
    }, { transaction: t });

    // Registrasi MLM untuk downline
    const reg = await MlmRegistration.create({
      customer_id: newDownline.id,
      mlm_package_id,
      upline_id: uplineReg.id, 
      placement_pos: placement_pos || 'left',
      status: 'active',
      start_date: new Date()
    }, { transaction: t });

    // Ambil setting wallet MLM
    const setting = await MLMSetting.findOne({ transaction: t });
    const walletsConfig = setting ? JSON.parse(setting.Wallets) : [];

    // Mapping name ke wallet_type_id (misal: Saldo = 1, Point = 2, Stamp = 3)
    const walletTypeMap = { Saldo: 1, Point: 2, Stamp: 3 };

    // Buat wallet downline
    const downlineWallets = [];
    for (const w of walletsConfig) {
      if (w.active) {
        const typeId = walletTypeMap[w.name];
        if (!typeId) continue; // skip jika name tidak valid
        const uw = await MlmUserWallet.create({
          customer_id: newDownline.id,
          wallet_type_id: typeId,
          balance: 0
        }, { transaction: t });
        downlineWallets.push(uw);
      }
    }

    // Pastikan upline punya wallet sebelum bonus
    let currentUplineId = uplineCustomer.id;
    while (currentUplineId) {
      const walletExists = await MlmUserWallet.findOne({ where: { customer_id: currentUplineId, wallet_type_id: 1 }, transaction: t });
      if (!walletExists) await MlmUserWallet.create({ customer_id: currentUplineId, wallet_type_id: 1, balance: 0 }, { transaction: t });

      const regUpline = await MlmRegistration.findOne({ where: { customer_id: currentUplineId }, transaction: t });
      currentUplineId = regUpline ? regUpline.upline_id : null;
    }

    // Jalankan bonus
    await giveReferralBonus({ newUserId: newDownline.id, packageValue, packageId: mlm_package_id, transaction: t });
    await giveMatchingBonus({ newUserId: newDownline.id, packageValue, packageId: mlm_package_id, transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Downline berhasil ditambahkan', data: { downline: newDownline, registration: reg, wallets: downlineWallets } });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Gagal tambah downline', error: err.message });
  }
};

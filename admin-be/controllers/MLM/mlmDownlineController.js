const { Customer, MLMPackage, MlmRegistration, MLMWallet, MlmUserWallet, WalletHistory, sequelize 
} = require('../../models');
const bcrypt = require('bcryptjs');
const { giveReferralBonus } = require('../../services/referralBonus');
const { giveMatchingBonus } = require('../../services/matchingBonus');

exports.addDownline = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      username,
      email,
      password,
      mlm_package_id,
      bank,
      no_rekening,
      nama_rekening,
      no_hp,
      parentId,        // node parent dari frontend
      placement_pos    // posisi 'left' / 'right'
    } = req.body;

    const loginUser = req.customer; // user login

    // Validasi parentId
    const uplineCustomer = await Customer.findByPk(parentId, { transaction: t });
    if (!uplineCustomer) {
      return res.status(400).json({ message: 'Parent tidak ditemukan' });
    }

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

    if (currentBalance < packageValue) {
      return res.status(400).json({ message: 'Saldo tidak cukup untuk join paket' });
    }

    // Ambil wallet user login
    const userWallet = await MlmUserWallet.findOne({
      where: { customer_id: loginUser.id, wallet_type_id: 1 },
      transaction: t
    });
    if (!userWallet) throw new Error('Wallet user login tidak ditemukan');

    const userAfter = currentBalance - packageValue;

    // Update saldo wallet user login
    await userWallet.update({ balance: userAfter }, { transaction: t });

    // Catat WalletHistory user login
    await WalletHistory.create({
      wallet_id: userWallet.id,
      customer_id: loginUser.id,
      username: loginUser.username,
      transaction_type_id: 14, // join MLM
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
      username,
      email,
      password: hashed,
      bank,
      no_rekening,
      nama_rekening,
      no_hp,
      referral: loginUser.id
    }, { transaction: t });

    // Registrasi MLM untuk downline
    const reg = await MlmRegistration.create({
      customer_id: newDownline.id,
      mlm_package_id,
      upline_id: uplineCustomer.id,
      placement_pos: placement_pos || 'left',
      status: 'active',
      start_date: new Date()
    }, { transaction: t });

    // Buat wallet downline berdasarkan template MLMWallet
    const walletTemplates = await MLMWallet.findAll({ transaction: t });
    const userWallets = [];
    for (const w of walletTemplates) {
      const uw = await MlmUserWallet.create({
        customer_id: newDownline.id,
        wallet_type_id: w.WalletTypeID,
        balance: 0
      }, { transaction: t });
      userWallets.push(uw);
    }

    // === Jalankan Bonus lewat services ===
// Jalankan Bonus
await giveReferralBonus({
  newUserId: newDownline.id,
  packageValue,        // dari saldo join paket user login
  packageId: mlm_package_id,
  transaction: t
});

await giveMatchingBonus({
  downline: newDownline,
  packageValue,        // dari saldo join paket user login
  packageId: mlm_package_id,
  transaction: t
});


    await t.commit();
    res.json({
      success: true,
      message: 'Downline berhasil ditambahkan',
      data: {
        downline: newDownline,
        registration: reg,
        wallets: userWallets
      }
    });

  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ message: 'Gagal tambah downline', error: err.message });
  }
};

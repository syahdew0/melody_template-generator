const { Customer, MLMPackage, MlmRegistration, MlmUserWallet, WalletHistory, sequelize } = require('../../models');

exports.joinMLM = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const customer_id = req.customer.id;
    const username = req.customer.username;
    const email = req.customer.email; // ambil email dari token user
    const { mlm_package_id, placement_pos, parentId } = req.body;

    // 🔒 Cek apakah sudah ada user lain (atau dirinya sendiri) dengan email yang sama sudah join MLM
    const existingByEmail = await MlmRegistration.findOne({
      include: [
        {
          model: Customer,
          as: 'Customer',
          where: { email }, // cocokkan email di tabel Customer
        }
      ],
      transaction: t
    });

    if (existingByEmail) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: "Email ini sudah digunakan untuk join MLM."
      });
    }

    // Ambil paket MLM
    const mlmPackage = await MLMPackage.findByPk(mlm_package_id, { transaction: t });
    if (!mlmPackage) throw new Error("Paket MLM tidak ditemukan");

    // Cek user sudah join paket ini
    const existingReg = await MlmRegistration.findOne({
      where: { customer_id, mlm_package_id, status: 'active' },
      transaction: t
    });
    if (existingReg) {
      await t.rollback();
      return res.status(400).json({ message: "Anda sudah join paket MLM ini" });
    }

    // Ambil atau buat wallet user
    let userWallet = await MlmUserWallet.findOne({
      where: { customer_id, wallet_type_id: 1 },
      transaction: t
    });
    if (!userWallet) {
      userWallet = await MlmUserWallet.create({
        customer_id,
        wallet_type_id: 1,
        balance: 0,
        created_by: username
      }, { transaction: t });
    }

    // Ambil saldo terakhir dari wallet_histories
    const lastHistory = await WalletHistory.findOne({
      where: { username, wallet_type_id: 1 },
      order: [['id', 'DESC']],
      transaction: t
    });
    const balanceBefore = lastHistory ? lastHistory.balance_after : userWallet.balance;

    const packageValue = parseFloat(mlmPackage.PackageValue || 0);
    if (balanceBefore < packageValue) {
      await t.rollback();
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    const balanceAfter = balanceBefore - packageValue;

    // Buat MLM registration
    const reg = await MlmRegistration.create({
      customer_id,
      mlm_package_id,
      upline_id: parentId || null,
      placement_pos: placement_pos || 'left',
      status: 'active',
      start_date: new Date()
    }, { transaction: t });

    // Update saldo wallet user
    await userWallet.update({ balance: balanceAfter }, { transaction: t });

    // Catat WalletHistory user
    const remarks = `Join MLM paket ${mlmPackage.MLMPackageName || mlmPackage.PackageName || 'paket'}`;
    const history = await WalletHistory.create({
      wallet_id: userWallet.id,
      customer_id,
      username,
      transaction_type_id: 14, // Join MLM
      wallet_type_id: 1,
      reference_id: reg.id,
      amount: -packageValue,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      remarks,
      status: 'success'
    }, { transaction: t });

    // Bonus 10% ke upline jika ada
    if (parentId) {
      let uplineWallet = await MlmUserWallet.findOne({
        where: { customer_id: parentId, wallet_type_id: 1 },
        transaction: t
      });

      const uplineUser = await Customer.findByPk(parentId, { transaction: t });
      if (!uplineWallet) {
        uplineWallet = await MlmUserWallet.create({
          customer_id: parentId,
          wallet_type_id: 1,
          balance: 0,
          created_by: uplineUser.username
        }, { transaction: t });
      }

      const bonus = packageValue * 0.1;
      const beforeUpline = uplineWallet.balance;
      const afterUpline = beforeUpline + bonus;

      await uplineWallet.update({ balance: afterUpline }, { transaction: t });

      // Catat WalletHistory upline
      await WalletHistory.create({
        wallet_id: uplineWallet.id,
        customer_id: parentId,
        username: uplineUser.username,
        transaction_type_id: 15, // Referral bonus
        wallet_type_id: 1,
        reference_id: reg.id,
        amount: bonus,
        balance_before: beforeUpline,
        balance_after: afterUpline,
        remarks: `Bonus referral dari downline ${username}`,
        status: 'success'
      }, { transaction: t });
    }

    await t.commit();
    return res.json({
      success: true,
      message: "Join MLM berhasil.",
      data: { registration: reg, history }
    });

  } catch (err) {
    await t.rollback();
    console.error('Join MLM Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal join MLM', error: err.message });
  }
};

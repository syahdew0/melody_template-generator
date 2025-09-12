const { Customer, MLMPackage, MlmRegistration, MlmUserWallet, WalletHistory, sequelize } = require('../../models');

exports.joinMLM = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const customer_id = req.customer.id;
    const username = req.customer.username;
    const { mlm_package_id, placement_pos, parentId } = req.body;

    // Ambil paket MLM
    const mlmPackage = await MLMPackage.findByPk(mlm_package_id, { transaction: t });
    if (!mlmPackage) throw new Error("Paket MLM tidak ditemukan");

    // Cek user login sudah join paket ini
    const existingReg = await MlmRegistration.findOne({
      where: { customer_id, mlm_package_id, status: 'active' },
      transaction: t
    });
    if (existingReg) {
      await t.rollback();
      return res.status(400).json({ message: "Anda sudah join paket MLM ini" });
    }

    // Ambil wallet user login
    const userWallet = await MlmUserWallet.findOne({
      where: { customer_id, wallet_type_id: 1 },
      transaction: t
    });
    if (!userWallet) throw new Error('Wallet MLM user tidak ditemukan');

    // Ambil saldo terakhir user login
    const lastHistory = await WalletHistory.findOne({
      where: { username, transaction_type_id: 14 }, // Join MLM
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

    // Cek apakah sudah ada WalletHistory untuk paket ini
    const existingHistory = await WalletHistory.findOne({
      where: {
        username,
        transaction_type_id: 14,
        remarks: `Join MLM paket ${mlmPackage.MLMPackageName || mlmPackage.PackageName || 'paket'}`
      },
      transaction: t
    });

    if (!existingHistory) {
      // Update saldo user login
      await userWallet.update({ balance: balanceAfter }, { transaction: t });

      // Catat WalletHistory user login
      await WalletHistory.create({
        wallet_id: userWallet.id,
        customer_id,
        username,
        transaction_type_id: 14, // Join MLM
        wallet_type_id: 1,
        amount: -packageValue,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        remarks: `Join MLM paket ${mlmPackage.MLMPackageName || mlmPackage.PackageName || 'paket'}`,
        status: 'success'
      }, { transaction: t });
    }

    // Buat MLM registration
    const reg = await MlmRegistration.create({
      customer_id,
      mlm_package_id,
      upline_id: parentId || null,
      placement_pos: placement_pos || 'left',
      status: 'active',
      start_date: new Date()
    }, { transaction: t });

    // Bonus 10% ke upline jika ada
    if (parentId) {
      const uplineWallet = await MlmUserWallet.findOne({
        where: { customer_id: parentId, wallet_type_id: 1 },
        transaction: t
      });
      if (uplineWallet) {
        const bonus = packageValue * 0.1;
        const before = uplineWallet.balance;
        const after = before + bonus;

        await uplineWallet.update({ balance: after }, { transaction: t });

        // Catat WalletHistory upline
        await WalletHistory.create({
          wallet_id: uplineWallet.id,
          customer_id: parentId,
          username: (await Customer.findByPk(parentId, { transaction: t })).username,
          transaction_type_id: 5, // bonus referral
          wallet_type_id: 1,
          amount: bonus,
          balance_before: before,
          balance_after: after,
          remarks: `Bonus referral dari downline ${username}`,
          status: 'success'
        }, { transaction: t });
      }
    }

    await t.commit();
    return res.json({ success: true, message: "Saldo diperbarui dan join MLM berhasil", data: { registration: reg } });

  } catch (err) {
    await t.rollback();
    console.error('Join MLM Error:', err);
    return res.status(500).json({ success: false, message: 'Gagal join MLM', error: err.message });
  }
};

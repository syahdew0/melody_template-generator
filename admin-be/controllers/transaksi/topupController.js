const { Topup, Customer, Wallet, Adjust, WalletSummary, WalletHistory, sequelize } = require('../../models');

module.exports = {
async create(req, res) {
  try {
    const { nominal } = req.body;
    const customer = req.customer;
    const userId = customer.username;

    if (!nominal || nominal <= 0) {
      return res.status(400).json({ message: 'Nominal harus lebih dari 0' });
    }

    const pending = await Topup.findOne({
      where: { username: userId, status: 'pending' }
    });

    if (pending) {
      return res.status(400).json({ message: 'Masih ada topup pending' });
    }

    const wallet = await Wallet.findOne({
      where: {
        customer_id: customer.id,
        wallet_type: 'saldo' // jika kamu pakai tipe wallet
      }
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    }

    const data = await Topup.create({
      username: userId,
      amount: nominal,
      status: 'pending',
      walletid: wallet.id,
      createdby: userId,
      createdon: new Date(),
      date: new Date()
    });

    res.json({ message: 'Topup diajukan', data });
  } catch (error) {
    console.error('Topup create error:', error);
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation Errors:', error.errors);
    }
    res.status(500).json({ message: 'Gagal membuat topup', error });
  }
}
,

  async list(req, res) {
    try {
      const { status } = req.query;
      const whereClause = {};

      if (status && ['pending', 'success', 'failed'].includes(status)) {
        whereClause.status = status;
      }

      const data = await Topup.findAll({
        where: whereClause,
        order: [['createdon', 'DESC']]
        // order: [['created_at', 'DESC']]

      });

      res.json(data);
    } catch (error) {
      console.error('Topup list error:', error);
      res.status(500).json({ message: 'Gagal mengambil data topup', error });
    }
  },

  async updateStatus(req, res) {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const data = await Topup.findByPk(id, { transaction: t });
    if (!data) {
      await t.rollback();
      return res.status(404).json({ message: 'Topup tidak ditemukan' });
    }

    const validStatus = ['success', 'failed'];
    if (!validStatus.includes(status)) {
      await t.rollback();
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    // Jalankan hanya jika status dari non-sukses ke sukses
    if (status === 'success' && data.status !== 'success') {
      // const wallet = await Wallet.findByPk(data.walletId, { transaction: t });
      const wallet = await Wallet.findByPk(data.walletid, { transaction: t });
      if (!wallet) {
        await t.rollback();
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      const latestHistory = await WalletHistory.findOne({
        where: { walletid: wallet.id },
        order: [['created_at', 'DESC']],
        transaction: t,
      });

      const previousBalance = latestHistory?.balance_after || 0;
      const newBalance = previousBalance + parseFloat(data.amount);

      await WalletHistory.create({
        walletId: wallet.id,
        username: data.username,
        // type: 'in',
        transaction_type: 'topup',
        amount: data.amount,
        // referenceid: `topup-${data.id}`,
        source_type: 'topup',
        source_id: data.id,
        balance_before: previousBalance,
        balance_after: newBalance,
        remarks: 'Topup berhasil',
        // createdon: new Date(),
        created_at: new Date(),
      }, { transaction: t });

      // Optional: update balance wallet langsung (jika sistem kamu pakai live balance)
      // wallet.balance = newBalance;
      // await wallet.save({ transaction: t });
      await Wallet.update(
        { balance: newBalance },
        { where: { id: wallet.id }, transaction: t }
      );

    }

    data.status = status;
    data.updatedon = new Date();
    data.updatedby = req.user?.username || 'admin';
    await data.save({ transaction: t });

    await t.commit();
    res.json({ message: 'Status topup berhasil diperbarui', data });
  } catch (error) {
    await t.rollback();
    console.error('Topup update error:', error);
    res.status(500).json({ message: 'Gagal update status topup', error });
  }
}
};
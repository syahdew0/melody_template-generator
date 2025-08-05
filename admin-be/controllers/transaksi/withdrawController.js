// const { Withdraw, Customer, Wallet, Adjust, WalletHistory } = require('../../models');
const { Withdraw, Customer, Wallet, Adjust, WalletHistory, sequelize } = require('../../models');

module.exports = {
  // Customer mengajukan withdraw
  async create(req, res) {
  const t = await sequelize.transaction();
  try {
    const { amount } = req.body;
    const customer = req.customer;

    if (!customer || !customer.username) {
      await t.rollback();
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!amount || parseFloat(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: 'Jumlah tidak boleh nol atau negatif' });
    }

    const wallet = await Wallet.findOne({
      where: { username: customer.username },
      transaction: t,
    });

    if (!wallet) {
      await t.rollback();
      return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    }

    const pending = await Withdraw.findOne({
      where: {
        username: customer.username,
        status: 'pending',
      },
      transaction: t,
    });

    if (pending) {
      await t.rollback();
      return res.status(400).json({ message: 'Masih ada withdraw pending' });
    }

    const latestHistory = await WalletHistory.findOne({
      where: { walletid: wallet.id },
      order: [['created_at', 'DESC']],
      transaction: t,
    });

    const currentBalance = latestHistory?.balance_after || 0;

    if (currentBalance < parseFloat(amount)) {
      await t.rollback();
      return res.status(400).json({ message: 'Saldo tidak mencukupi' });
    }

    // Simpan withdraw (status pending)
    const withdraw = await Withdraw.create({
      username: customer.username,
      amount,
      status: 'pending',
      walletid: wallet.id,
      date: new Date(),
      createdon: new Date(),
      createdby: customer.username,
    }, { transaction: t });

    // Catat history
    await WalletHistory.create({
        walletId: wallet.id,
        username: customer.username,
        type: 'out',
        amount: withdraw.amount,
        source_type: 'withdraw',
        source_id: withdraw.id,
        referenceid: `withdraw-${withdraw.id}`,
        balance_before: currentBalance,
        balance_after: currentBalance, 
        remarks: 'Pengajuan withdraw',
        created_at: new Date(),
        transaction_type: 'withdraw'
      }, { transaction: t });


    await t.commit();
    res.json({ message: 'Withdraw berhasil diajukan', data: withdraw });
  } catch (error) {
    await t.rollback();
    console.error('Withdraw create error:', error);
    res.status(500).json({ message: 'Gagal membuat withdraw', error });
  }
},

  // Admin melihat semua withdraw
async list(req, res) {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const data = await Withdraw.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'username', 'email', 'nama_rekening', 'no_rekening', 'bank']
        },
        {
          model: WalletHistory,
          as: 'wallethistory',
          attributes: ['balance_before', 'balance_after', 'amount']
        }
      ],
      order: [['createdon', 'DESC']]
    });

    const summary = await Withdraw.findAll({
      attributes: [
        'status',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount']
      ],
      group: ['status'],
      where
    });

    res.json({ data, summary });
  } catch (error) {
    console.error('Withdraw list error:', error);
    res.status(500).json({ message: 'Gagal mengambil data withdraw', error });
  }
},
  // Admin update status withdraw
    async updateStatus(req, res) {
    const t = await sequelize.transaction();
    try {
      const { id } = req.params;
      const { status } = req.body;

      const data = await Withdraw.findByPk(id, { transaction: t });
      if (!data) {
        await t.rollback();
        return res.status(404).json({ message: 'Withdraw tidak ditemukan' });
      }

      const wallet = await Wallet.findByPk(data.walletid, { transaction: t });
      if (!wallet) {
        await t.rollback();
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      const validStatus = ['pending', 'success', 'failed'];
      if (!validStatus.includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: 'Status tidak valid' });
      }

      // Jika status diubah menjadi success
      if (status === 'success' && data.status !== 'success') {
        const latestHistory = await WalletHistory.findOne({
          where: { walletid: wallet.id },
          order: [['created_at', 'DESC']],
          transaction: t
        });

        const previousBalance = latestHistory?.balance_after || 0;
        const newBalance = previousBalance - parseFloat(data.amount);

        if (newBalance < 0) {
          await t.rollback();
          return res.status(400).json({ message: 'Saldo tidak cukup untuk withdraw ini' });
        }

        const referenceid = `withdraw-${data.id}`;

        // Tambahkan ke WalletHistory
        await WalletHistory.create({
          walletId: wallet.id,
          username: data.username,
          type: 'out',
          transaction_type: 'withdraw',
          amount: data.amount,
          source_type: 'withdraw',
          source_id: data.id,
          balance_before: previousBalance,
          balance_after: newBalance,
          remarks: 'Withdraw berhasil',
          created_at: new Date()
        }, { transaction: t });

        // Tambahkan ke Adjust jika belum ada
        const alreadyAdjusted = await Adjust.findOne({
          where: { referenceid },
          transaction: t
        });

        if (!alreadyAdjusted) {
          await Adjust.create({
            username: data.username,
            amount: data.amount,
            type: 'out',
            walletid: wallet.id,
            remarks: 'Withdraw success',
            referenceid,
            createdby: req.user?.username || 'admin',
            createdon: new Date()
          }, { transaction: t });
        }

        // Tambahkan ke WalletSummary
        // const today = new Date().toISOString().split('T')[0];
        // const [summary, created] = await WalletSummary.findOrCreate({
        //   where: {
        //     walletid: wallet.id,
        //     username: data.username,
        //     transaction_type_id: 2, // 2 = Withdraw
        //     summarydate: today
        //   },
        //   defaults: {
        //     amount: data.amount
        //   },
        //   transaction: t
        // });

        // if (!created) {
        //   summary.amount += parseFloat(data.amount);
        //   await summary.save({ transaction: t });
        // }
      }

      // Update status withdraw
      data.status = status;
      data.updatedon = new Date();
      data.updatedby = req.user?.username || 'admin';
      await data.save({ transaction: t });

      await t.commit();
      res.json({ message: 'Status withdraw berhasil diperbarui', data });
  
    } catch (error) {
      await t.rollback();
      console.error('Withdraw update status error:', error);
      res.status(500).json({ message: 'Gagal memperbarui status withdraw', error });
    }
  },
  // Di withdrawController.js
async listCustomer(req, res) {
  try {
    const username = req.customer.username;
    const data = await Withdraw.findAll({
      where: { username },
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['nama_rekening', 'no_rekening', 'bank']
        }
      ],
      order: [['createdon', 'DESC']],
    });
    res.json(data);
  } catch (error) {
    console.error('Withdraw customer list error:', error);
    res.status(500).json({ message: 'Gagal mengambil data withdraw', error });
  }
}
};

// module.exports = withdrawController;
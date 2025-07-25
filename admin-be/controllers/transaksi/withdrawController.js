const { Withdraw, Customer, Wallet, Adjust, WalletHistory } = require('../../models');

module.exports = {
  // Customer mengajukan withdraw
  async create(req, res) {
    try {
      const { amount } = req.body;
      const customer = req.customer;

      if (!customer || !customer.username) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (!amount || parseFloat(amount) <= 0) {
        return res.status(400).json({ message: 'Jumlah tidak boleh nol atau negatif' });
      }

      const wallet = await Wallet.findOne({ where: { customer_id: customer.id } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      const pending = await Withdraw.findOne({
        where: { username: customer.username, status: 'pending' }
      });

      if (pending) {
        return res.status(400).json({ message: 'Masih ada withdraw pending' });
      }

      // Check balance berdasarkan latest wallet history
      const latestHistory = await WalletHistory.findOne({
        where: { walletid: wallet.id },
        order: [['createdon', 'DESC']]
      });

      const currentBalance = latestHistory?.balance_after || 0;

      if (currentBalance < parseFloat(amount)) {
        return res.status(400).json({ message: 'Saldo tidak mencukupi' });
      }

      const data = await Withdraw.create({
        username: customer.username,
        amount,
        status: 'pending',
        walletid: wallet.id,
        createdby: customer.username,
        createdon: new Date()
      });

      res.json({ message: 'Withdraw berhasil diajukan', data });
    } catch (error) {
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
            attributes: ['id', 'username', 'email']
          },
          {
            model: Wallet,
            as: 'wallet',
            attributes: ['id', 'balance']
          }
        ],
        order: [['createdon', 'DESC']]
      });

      res.json(data);
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
          order: [['createdon', 'DESC']],
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
          walletid: wallet.id,
          username: data.username,
          type: 'out',
          amount: data.amount,
          referenceid,
          balance_before: previousBalance,
          balance_after: newBalance,
          remarks: 'Withdraw berhasil',
          createdon: new Date()
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
        const today = new Date().toISOString().split('T')[0];
        const [summary, created] = await WalletSummary.findOrCreate({
          where: {
            walletid: wallet.id,
            username: data.username,
            transaction_type_id: 2, // 2 = Withdraw
            summarydate: today
          },
          defaults: {
            amount: data.amount
          },
          transaction: t
        });

        if (!created) {
          summary.amount += parseFloat(data.amount);
          await summary.save({ transaction: t });
        }
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
      console.error('Withdraw update error:', error);
      res.status(500).json({ message: 'Gagal update status withdraw', error });
    }
  },

  async getMyWalletSummary(req, res) {
    try {
      const user = req.user;
      if (!user || !user.username) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wallet = await Wallet.findOne({ where: { customer_id: user.id } });
      if (!wallet) return res.status(404).json({ message: 'Wallet tidak ditemukan' });

      const [totalTopup, totalWithdraw, totalAdjustIn, totalAdjustOut] = await Promise.all([
        Topup.sum('amount', { where: { username: user.username, status: 'success' } }),
        Withdraw.sum('amount', { where: { username: user.username, status: 'success' } }),
        Adjust.sum('amount', { where: { username: user.username, type: 'in' } }),
        Adjust.sum('amount', { where: { username: user.username, type: 'out' } }),
      ]);

      const latestHistory = await WalletHistory.findOne({
        where: { walletid: wallet.id },
        order: [['createdon', 'DESC']]
      });

      const auditBalance = latestHistory?.balance_after ?? 0;
      const isBalanceCorrect = Math.abs(wallet.balance - auditBalance) < 0.0001;

      res.json({
        balance: wallet.balance,
        total_topup: totalTopup || 0,
        total_withdraw: totalWithdraw || 0,
        total_adjust_in: totalAdjustIn || 0,
        total_adjust_out: totalAdjustOut || 0,
        is_balance_correct: isBalanceCorrect
      });
    } catch (error) {
      console.error('Wallet summary error:', error);
      res.status(500).json({ message: 'Gagal mengambil ringkasan wallet', error });
    }
  }
};

// module.exports = withdrawController;
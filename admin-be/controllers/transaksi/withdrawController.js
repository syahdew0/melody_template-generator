const { Withdraw, Customer, WalletHistory, sequelize } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  // Customer buat withdraw
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const { amount, remarks } = req.body;
      const customer = req.customer;

      if (!customer || !customer.username) {
        await t.rollback();
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const withdrawAmount = parseFloat(amount);
      if (!withdrawAmount || withdrawAmount <= 0) {
        await t.rollback();
        return res.status(400).json({ message: 'Jumlah tidak boleh nol atau negatif' });
      }

      // cek withdraw pending
      const pendingWithdraw = await Withdraw.findOne({
        where: { username: customer.username, status: 'pending' },
        transaction: t
      });
      if (pendingWithdraw) {
        await t.rollback();
        return res.status(400).json({ message: 'Masih ada withdraw yang pending.' });
      }

      // ambil saldo terakhir dari WalletHistory
      const latestHistory = await WalletHistory.findOne({
        where: { username: customer.username, wallet_type_id: 1 },
        order: [['created_at', 'DESC']],
        transaction: t,
        raw: true
      });
      const balanceBefore = parseFloat(latestHistory?.balance_after ?? 0);
      if (balanceBefore < withdrawAmount) {
        await t.rollback();
        return res.status(400).json({ message: 'Saldo tidak mencukupi' });
      }

      // simpan withdraw
      const withdraw = await Withdraw.create({
        username: customer.username,
        amount: withdrawAmount,
        status: 'pending',
        date: new Date(),
        createdon: new Date(),
        createdby: customer.username,
        remarks: remarks || '',
      }, { transaction: t });

      // simpan ke WalletHistory
      await WalletHistory.create({
        username: customer.username,
        wallet_type_id: 1,
        transaction_type_id: 2, // withdraw
        reference_id: withdraw.id,
        balance_before: balanceBefore,
        balance_after: balanceBefore - withdrawAmount,
        amount: -withdrawAmount,
        remarks: 'Pengajuan withdraw',
        status: 'pending',
        type: 'out',
        created_at: new Date()
      }, { transaction: t });

      await t.commit();
      res.json({ message: 'Withdraw berhasil diajukan', data: withdraw });
    } catch (error) {
      await t.rollback();
      console.error('Withdraw create error:', error);
      res.status(500).json({ message: 'Gagal membuat withdraw', error });
    }
  },

  // Admin lihat semua withdraw
  async list(req, res) {
    try {
      const { status, username, page = 1, limit = 10, fromDate, toDate } = req.query;
      const where = {};

      if (status && ['pending', 'success', 'failed'].includes(status)) where.status = status;
      if (username) where.username = username;

      if (fromDate || toDate) {
        where.createdon = {};
        if (fromDate) where.createdon[Op.gte] = new Date(fromDate);
        if (toDate) where.createdon[Op.lte] = new Date(new Date(toDate).setHours(23,59,59,999));
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

const { count, rows } = await Withdraw.findAndCountAll({
  where,
  include: [
    {
      model: Customer,
      as: 'customer',
      attributes: ['id','username','email','nama_rekening','no_rekening','bank']
    },
    {
      model: WalletHistory,
      as: 'wallethistories',   // <--- harus sama dengan alias di model
      attributes: ['balance_before','balance_after','amount','status']
    }
  ],
  order: [['createdon','DESC']],
  limit: parseInt(limit),
  offset,
});

      const summary = rows.reduce((acc, wd) => {
        acc[wd.status] = (acc[wd.status] || 0) + parseFloat(wd.amount || 0);
        return acc;
      }, {});

      const summaryArray = Object.entries(summary).map(([status, total]) => ({ status, total_amount: total }));

      res.json({
        data: rows,
        summary: summaryArray,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalItems: count,
      });
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

      const validStatus = ['pending', 'success', 'failed'];
      if (!validStatus.includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: 'Status tidak valid' });
      }

      if (data.status === status) {
        await t.rollback();
        return res.status(400).json({ message: 'Status sudah sama' });
      }

      const latestHistory = await WalletHistory.findOne({
        where: { username: data.username, wallet_type_id: 1, reference_id: data.id },
        order: [['created_at', 'DESC']],
        transaction: t
      });
      if (!latestHistory) {
        await t.rollback();
        return res.status(404).json({ message: 'WalletHistory untuk withdraw ini tidak ditemukan' });
      }

      const balanceBefore = parseFloat(latestHistory.balance_before ?? 0);
      const balanceAfter = parseFloat(latestHistory.balance_after ?? 0);
      const withdrawAmount = parseFloat(data.amount);

      if (status === 'success') {
        latestHistory.status = 'success';
        latestHistory.remarks = 'Withdraw berhasil';
        await latestHistory.save({ transaction: t });
      }

      if (status === 'failed') {
        await WalletHistory.create({
          username: data.username,
          wallet_type_id: 1,
          type: 'in',
          transaction_type_id: 3,
          transaction_type: 'withdraw_dibatalkan',
          reference_id: data.id,
          source_id: data.id,
          balance_before: balanceAfter,
          balance_after: balanceAfter + withdrawAmount,
          amount: withdrawAmount,
          remarks: 'Saldo dikembalikan karena withdraw ditolak',
          status: 'canceled',
          created_at: new Date()
        }, { transaction: t });

        latestHistory.status = 'failed';
        latestHistory.transaction_type = 'withdraw_ditolak';
        latestHistory.transaction_type_id = 4;
        latestHistory.remarks = 'Withdraw ditolak oleh admin';
        await latestHistory.save({ transaction: t });
      }

      data.status = status;
      data.updatedon = new Date();
      data.updatedby = req.user?.username || 'admin';
      await data.save({ transaction: t });

      await t.commit();
      res.json({ message: `Status withdraw berhasil diubah menjadi ${status}`, data });
    } catch (error) {
      await t.rollback();
      console.error('Withdraw update status error:', error);
      res.status(500).json({ message: 'Gagal memperbarui status withdraw', error });
    }
  },

  // Customer list withdraw
  async listCustomer(req, res) {
    try {
      const username = req.customer.username;
      const { fromDate, toDate } = req.query;
      const whereClause = { username };

      if (fromDate || toDate) {
        whereClause.createdon = {};
        if (fromDate) whereClause.createdon[Op.gte] = new Date(fromDate);
        if (toDate) {
          const toDateEnd = new Date(toDate);
          toDateEnd.setHours(23, 59, 59, 999);
          whereClause.createdon[Op.lte] = toDateEnd;
        }
      }

      const data = await Withdraw.findAll({
        where: whereClause,
        attributes: ['id', 'amount', 'status', 'createdon', 'remarks', 'date'],
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
  },

  // Bulk update status (tanpa Wallet)
  async bulkUpdateStatus(req, res) {
    const t = await sequelize.transaction();
    try {
      const { ids, status } = req.body;
      const validStatus = ['success', 'failed'];
      if (!Array.isArray(ids) || !validStatus.includes(status)) {
        await t.rollback();
        return res.status(400).json({ message: 'Data tidak valid' });
      }

      for (const id of ids) {
        const data = await Withdraw.findByPk(id, { transaction: t });
        if (!data || data.status === status) continue;

        const latestHistory = await WalletHistory.findOne({
          where: { username: data.username, wallet_type_id: 1, reference_id: data.id },
          order: [['created_at', 'DESC']],
          transaction: t
        });
        const previousBalance = latestHistory?.balance_after || 0;

        if (status === 'success') {
          await WalletHistory.create({
            username: data.username,
            type: 'out',
            transaction_type_id: 2,
            transaction_type: 'withdraw',
            amount: data.amount,
            source_type: 'withdraw',
            source_id: data.id,
            reference_id: data.id,
            balance_before: previousBalance,
            balance_after: previousBalance - parseFloat(data.amount),
            remarks: 'Withdraw berhasil',
            created_at: new Date()
          }, { transaction: t });
        }

        if (status === 'failed') {
          await WalletHistory.create({
            username: data.username,
            type: 'in',
            transaction_type_id: 3,
            transaction_type: 'withdraw_dibatalkan',
            amount: parseFloat(data.amount),
            source_type: 'withdraw',
            source_id: data.id,
            reference_id: data.id,
            balance_before: previousBalance,
            balance_after: previousBalance,
            remarks: 'Withdraw ditolak oleh admin',
            status: 'canceled',
            created_at: new Date()
          }, { transaction: t });

          if (latestHistory) {
            latestHistory.status = 'failed';
            latestHistory.transaction_type = 'withdraw_ditolak';
            latestHistory.transaction_type_id = 4;
            latestHistory.remarks = 'Withdraw ditolak oleh admin';
            await latestHistory.save({ transaction: t });
          }
        }

        data.status = status;
        data.updatedon = new Date();
        data.updatedby = req.user?.username || 'admin';
        await data.save({ transaction: t });
      }

      await t.commit();
      res.json({ message: `Berhasil update status ke ${status}` });
    } catch (error) {
      await t.rollback();
      console.error('Bulk update withdraw error:', error);
      res.status(500).json({ message: 'Gagal update status massal', error });
    }
  }
};
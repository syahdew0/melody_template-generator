// const { Withdraw, Customer, Wallet, Adjust, WalletHistory } = require('../../models');
const { Withdraw, Customer, Wallet, Adjust, WalletHistory, sequelize } = require('../../models');
const { Op } = require('sequelize');


module.exports = {
  // Customer mengajukan withdraw
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

    const wallet = await Wallet.findOne({
      where: { username: customer.username },
      transaction: t,
    });

    if (!wallet) {
      await t.rollback();
      return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    }

    // ==== CEK PENDING ====
    const pendingWithdraw = await Withdraw.findOne({
      where: {
        username: customer.username,
        status: 'pending'
      },
      transaction: t
    });
    if (pendingWithdraw) {
      await t.rollback();
      return res.status(400).json({ message: 'Masih ada withdraw yang pending. Selesaikan dulu sebelum mengajukan withdraw baru.' });
    }

    const latestHistory = await WalletHistory.findOne({
      where: { username: customer.username,  wallet_type: 'saldo' },
      order: [['created_at', 'DESC']],
      transaction: t,
      raw: true
    });

    const balanceBefore = parseFloat(latestHistory?.balance_after ?? wallet.balance ?? 0);
    if (balanceBefore < withdrawAmount) {
      await t.rollback();
      return res.status(400).json({ message: 'Saldo tidak mencukupi' });
    }

    // Simpan withdraw (status pending)
    const withdraw = await Withdraw.create({
      username: customer.username,
      amount: withdrawAmount,
      status: 'pending',
      walletid: wallet.id,
      date: new Date(),
      createdon: new Date(),
      createdby: customer.username,
      remarks: remarks || '',
    }, { transaction: t });

    // Potong saldo wallet
    wallet.balance = balanceBefore - withdrawAmount;
    await wallet.save({ transaction: t });

    // Catat history
    await WalletHistory.create({
      walletId: wallet.id,
      username: customer.username,
      type: 'out',
      transaction_type_id: 2,
      transaction_type: 'withdraw',
      amount: -withdrawAmount,
      source_type: 'withdraw',
      source_id: withdraw.id,
      reference_id: withdraw.id,
      balance_before: balanceBefore,
      balance_after: wallet.balance,
      remarks: 'Pengajuan withdraw',
      created_at: new Date(),
      status: 'pending',
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
    const { status, username, page = 1, limit = 10, fromDate, toDate } = req.query;
    const where = {};

    if (status && ['pending', 'success', 'failed'].includes(status)) where.status = status;
    if (username) where.username = username;

    // Filter tanggal dibuat di sini
    if (fromDate && toDate) {
      where.createdon = {
        [Op.between]: [new Date(fromDate), new Date(new Date(toDate).setHours(23,59,59,999))]
      };
    } else if (fromDate) {
      where.createdon = {
        [Op.gte]: new Date(fromDate)
      };
    } else if (toDate) {
      where.createdon = {
        [Op.lte]: new Date(new Date(toDate).setHours(23,59,59,999))
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Withdraw.findAndCountAll({
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
      order: [['createdon', 'DESC']],
      limit: parseInt(limit),
      offset,
    });

      // Buat summary jumlah nominal per status
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

    if (data.status === status) {
      await t.rollback();
      return res.status(400).json({ message: 'Status sudah sama' });
    }

    // Ambil history withdraw yang dibuat saat pengajuan
    const latestHistory = await WalletHistory.findOne({
      where: { walletId: wallet.id, reference_id: data.id },
      order: [['created_at', 'DESC']],
      transaction: t
    });

    if (!latestHistory) {
      await t.rollback();
      return res.status(404).json({ message: 'WalletHistory untuk withdraw ini tidak ditemukan' });
    }

    if (status === 'success') {
     // Sukses
latestHistory.transaction_type = 'withdraw'; // tetap ENUM valid
latestHistory.remarks = 'Withdraw berhasil'; // tulis detail disetujui di sini
latestHistory.status = 'success';
await latestHistory.save({ transaction: t });

    }

if (status === 'failed') {
  const latestBalanceAfter = parseFloat(latestHistory.balance_after) || 0;
  const withdrawAmount = parseFloat(data.amount) || 0;

  // kembalikan saldo wallet
  wallet.balance = latestBalanceAfter + withdrawAmount;
  await wallet.save({ transaction: t });

  // buat history baru
  await WalletHistory.create({
    walletId: wallet.id,
    username: data.username,
    type: 'in',                    // saldo masuk
    transaction_type_id: 2,
    transaction_type: 'withdraw',  // tetap ENUM valid
    amount: -withdrawAmount,        // positif
    source_type: 'withdraw',
    source_id: data.id,
    reference_id: data.id,
    balance_before: latestBalanceAfter,
    balance_after: wallet.balance,
    remarks: 'Withdraw ditolak oleh admin',
    status: 'failed',
    wallet_type: 'saldo',
    created_at: new Date()
  }, { transaction: t });
}


    // Update status withdraw
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
}

,
  // Di withdrawController.js
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
      if (!data) continue; // skip jika tidak ditemukan

      if (data.status === status) continue; // skip jika sudah sama

      const wallet = await Wallet.findByPk(data.walletid, { transaction: t });
      if (!wallet) continue;

      const latestHistory = await WalletHistory.findOne({
        where: { walletid: wallet.id },
        order: [['created_at', 'DESC']],
        transaction: t
      });

      const previousBalance = latestHistory?.balance_after || 0;

      if (status === 'success') {
        const newBalance = previousBalance - parseFloat(data.amount);
        if (newBalance < 0) {
          await t.rollback();
          return res.status(400).json({ message: `Saldo tidak cukup untuk withdraw ID ${id}` });
        }

        await WalletHistory.create({
          walletId: wallet.id,
          username: data.username,
          type: 'out',
          transaction_type_id: 2,
          transaction_type: 'withdraw',
          amount: data.amount,
          source_type: 'withdraw',
          source_id: data.id,
          reference_id: data.id,
          balance_before: previousBalance,
          balance_after: newBalance,
          remarks: 'Withdraw berhasil',
          created_at: new Date()
        }, { transaction: t });
      }

      // if (status === 'failed') {
      //   await WalletHistory.create({
      //     walletId: wallet.id,
      //     username: data.username,
      //     type: 'out',
      //     transaction_type: 'withdraw',
      //     amount: 0,
      //     source_type: 'withdraw',
      //     source_id: data.id,
      //     reference_id: data.id,
      //     balance_before: previousBalance,
      //     balance_after: previousBalance,
      //     remarks: 'Withdraw ditolak oleh admin',
      //     created_at: new Date()
      //   }, { transaction: t });
      // }
      if (status === 'failed') {
      await WalletHistory.create({
        walletId: wallet.id,
        username: data.username,
        transaction_type_id: 2,
        type: 'out',
        transaction_type: 'withdraw',
        amount: -parseFloat(data.amount), 
        source_type: 'withdraw',
        status,
        source_id: data.id,
        reference_id: data.id,
        balance_before: previousBalance,
        balance_after: previousBalance, 
        remarks: 'Withdraw ditolak oleh admin',
        created_at: new Date()
      }, { transaction: t });
}

      // Update status withdraw
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

    
// module.exports = withdrawController;
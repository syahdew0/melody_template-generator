const { Topup, Customer, Wallet, Adjust, WalletSummary, WalletHistory, sequelize } = require('../../models');
// const { Op } = require('sequelize');

module.exports = {
async create(req, res) {
  try {
    const { nominal, remarks } = req.body;
    const customer = req.customer;
    const userId = customer.username;

    if (!nominal || nominal <= 0) {
      return res.status(400).json({ message: 'Nominal harus lebih dari 0' });
    }

      if (remarks && remarks.length > 255) {
      return res.status(400).json({ message: 'Keterangan terlalu panjang (maks 255 karakter)' });
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
      date: new Date(),
      customer_id: customer.id,
      remarks: remarks || '',
      // bank_name: bank.bank_name, 
      // account_number: bank.account_number,
      // account_name: bank.account_name 
    });

    res.json({ message: 'Topup diajukan', data });
  } catch (error) {
    console.error('Topup create error:', error);
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation Errors:', error.errors);
    }

    res.status(500).json({ message: 'Gagal membuat topup', error });
  }
},

  async list(req, res) {
  try {
    const { status, username } = req.query;
    const whereClause = {};

    if (status && ['pending', 'success', 'failed'].includes(status)) {
      whereClause.status = status;
    }

    if (username) {
      whereClause.username = username;
    }

    const data = await Topup.findAll({
      where: whereClause, 
      include: [{
        model: Customer,
        as: 'Customer',
        attributes: ['id', 'username', 'nama_rekening']
      }],
      order: [['createdon', 'DESC']]
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
        type: 'in',
        transaction_type: 'topup',
        amount: data.amount,
       reference_id: data.id,
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

       // Insert ke WalletSummary
      await WalletSummary.create({
      summary_date: new Date(),
      wallet_id: data.walletid,
      username: data.username,
      transaction_type_id: 1, 
      amount: data.amount
    }, { transaction: t });

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
},
async getTopupList(req, res) {
  const customerId = req.customer.id;
  const topups = await Topup.findAll({
    where: { username: req.customer.username },
    order: [['date', 'DESC']],
    // include: [
    // {
    //   model: CompanyBank,
    //   as: 'company_bank' 
    // }
  // ]
  });
  // res.json(topups);
   res.json({ data: topups });
},

async getTopupSummary(req, res) {
  try {
    const { username } = req.query;

    const where = {};
    if (username) {
      where.username = username;
    }

    const summary = await Topup.findAll({
      attributes: [
        'status',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total_amount'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: ['status'],
      raw: true
    });

    res.json(summary);
  } catch (error) {
    console.error('Gagal ambil summary topup:', error);
    res.status(500).json({ message: 'Gagal ambil summary topup' });
  }
}


};
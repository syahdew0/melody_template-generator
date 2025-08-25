const { Adjust, Customer, Wallet, WalletHistory } = require('../../models');
const { Op } = require('sequelize');

// Mapping transaction_type_id
const TRANSACTION_TYPE_IDS = {
  adjust_plus: 3,
  adjust_minus: 4,
  point_plus: 5,
  point_minus: 6,
  stamp_plus: 7,
  stamp_minus: 8,
};

module.exports = {
  async create(req, res) {
    try {
      const { username, amount, category, type, remarks } = req.body;
      const adminUsername = req.user?.username || 'system';

      // Validasi input
      if (!username || amount === undefined || !category || !type) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      if (amount === 0) return res.status(400).json({ message: 'Jumlah tidak boleh nol' });
      if (!['saldo', 'point', 'stamp'].includes(category)) {
        return res.status(400).json({ message: 'Category harus salah satu dari saldo, point, atau stamp' });
      }
      if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ message: 'Type harus salah satu dari in atau out' });
      }

      // Cari customer
      const customer = await Customer.findOne({ where: { username } });
      if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

      const adjustedAmount = type === 'out' ? -Math.abs(amount) : Math.abs(amount);

      // Cari atau buat wallet sesuai category
      let wallet = await Wallet.findOne({ where: { customer_id: customer.id, wallet_type: category } });
      if (!wallet) {
        wallet = await Wallet.create({
          customer_id: customer.id,
          username: customer.username,
          wallet_type: category,
          balance: 0,
          createdon: new Date(),
          updatedon: new Date(),
        });
      }

      // Ambil saldo terakhir
      const lastHistory = await WalletHistory.findOne({
        where: { walletId: wallet.id },
        order: [['created_at', 'DESC']],
      });
      const balanceBefore = lastHistory?.balance_after || wallet.balance || 0;
      const finalBalance = balanceBefore + adjustedAmount;

      if (finalBalance < 0) return res.status(400).json({ message: `${category} tidak cukup` });

      // Buat record adjust
      const adjust = await Adjust.create({
        username,
        amount: adjustedAmount,
        type,
        category,
        walletid: wallet.id,
        remarks,
        createdby: adminUsername,
        createdon: new Date(),
      });

      // Tentukan transaction_type_id
      let transactionTypeId = null;
      if (category === 'saldo') transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.adjust_plus : TRANSACTION_TYPE_IDS.adjust_minus;
      if (category === 'point') transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.point_plus : TRANSACTION_TYPE_IDS.point_minus;
      if (category === 'stamp') transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.stamp_plus : TRANSACTION_TYPE_IDS.stamp_minus;

      // Simpan WalletHistory
      await WalletHistory.create({
        walletId: wallet.id,
        username,
        transaction_type_id: transactionTypeId,
        source_type: 'adjust',
        source_id: adjust.id,
        reference_id: adjust.id,
        amount: adjustedAmount,
        balance_before: balanceBefore,
        balance_after: finalBalance,
        remarks,
        status: 'success',
        createdby: adminUsername,
        created_at: new Date(),
        wallet_type: category,
      });

      // Update balance di Wallet
      await Wallet.update({ balance: finalBalance, updatedon: new Date() }, { where: { id: wallet.id } });

      // Update point/stamp di Customer jika perlu
      if (category === 'point') await customer.update({ point: finalBalance });
      if (category === 'stamp') await customer.update({ stamp: finalBalance });

      return res.json({ message: `Penyesuaian ${category} berhasil`, data: adjust });
    } catch (error) {
      console.error('Gagal membuat adjust:', error);
      return res.status(500).json({ message: 'Gagal membuat adjust', error });
    }
  },

  async list(req, res) {
    try {
      const { username, fromDate, toDate, page = 1, limit = 10 } = req.query;

      const whereClause = {};
      if (username) whereClause.username = username;

      if (fromDate && toDate) {
        whereClause.createdon = {
          [Op.between]: [
            new Date(fromDate),
            new Date(new Date(toDate).setHours(23, 59, 59, 999)),
          ],
        };
      } else if (fromDate) {
        whereClause.createdon = { [Op.gte]: new Date(fromDate) };
      } else if (toDate) {
        whereClause.createdon = { [Op.lte]: new Date(new Date(toDate).setHours(23, 59, 59, 999)) };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows, count } = await Adjust.findAndCountAll({
        where: whereClause,
        order: [['createdon', 'DESC']],
        offset,
        limit: parseInt(limit),
      });

      res.json({
        data: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalItems: count,
      });
    } catch (error) {
      console.error('Gagal mengambil data adjust:', error);
      res.status(500).json({ message: 'Gagal mengambil data adjust', error });
    }
  },

  async getAdjustSummary(req, res) {
    try {
      const { username, fromDate, toDate } = req.query;

      const whereClause = {};
      if (username) whereClause.username = username;

      if (fromDate && toDate) {
        whereClause.createdon = {
          [Op.between]: [
            new Date(fromDate),
            new Date(new Date(toDate).setHours(23, 59, 59, 999)),
          ],
        };
      } else if (fromDate) {
        whereClause.createdon = { [Op.gte]: new Date(fromDate) };
      } else if (toDate) {
        whereClause.createdon = { [Op.lte]: new Date(new Date(toDate).setHours(23, 59, 59, 999)) };
      }

      const categories = ['saldo', 'point', 'stamp'];
      const total = {};

      for (let cat of categories) {
        const inResult = await Adjust.sum('amount', { where: { ...whereClause, category: cat, amount: { [Op.gt]: 0 } } });
        const outResult = await Adjust.sum('amount', { where: { ...whereClause, category: cat, amount: { [Op.lt]: 0 } } });

        total[cat] = {
          in: inResult || 0,
          out: outResult || 0,
          net: (inResult || 0) + (outResult || 0),
        };
      }

      res.json({ total });
    } catch (err) {
      console.error('Error fetching adjust summary:', err);
      res.status(500).json({ message: 'Gagal mengambil data summary adjust.' });
    }
  },
};

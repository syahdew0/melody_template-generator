const { Adjust, Customer, WalletHistory } = require('../../models');
const { Op } = require('sequelize');

const TRANSACTION_TYPE_IDS = {
  adjust_plus: 5,
  adjust_minus: 6,
  point_plus: 7,
  point_minus: 8,
  stamp_plus: 9,
  stamp_minus: 10,
};
const WALLET_TYPE_IDS = {
  saldo: 1,
  point: 2,
  stamp: 3,
};

module.exports = {
  async create(req, res) {
    try {
      const { username, amount, category, type, remarks } = req.body;
      const adminUsername = req.user?.username || 'system';

      if (!username || amount === undefined || !category || !type)
        return res.status(400).json({ message: 'Data tidak lengkap' });
      if (amount === 0)
        return res.status(400).json({ message: 'Jumlah tidak boleh nol' });
      if (!['saldo', 'point', 'stamp'].includes(category))
        return res.status(400).json({ message: 'Category harus salah satu dari saldo, point, atau stamp' });
      if (!['in', 'out'].includes(type))
        return res.status(400).json({ message: 'Type harus salah satu dari in atau out' });

      const customer = await Customer.findOne({ where: { username } });
      if (!customer) return res.status(404).json({ message: 'Customer tidak ditemukan' });

      const adjustedAmount = type === 'out' ? -Math.abs(amount) : Math.abs(amount);

      // Ambil saldo terakhir dari WalletHistory
      const lastHistory = await WalletHistory.findOne({
  where: { username, wallet_type_id: WALLET_TYPE_IDS[category] },
  order: [['created_at', 'DESC']],
  raw: true
});

      const balanceBefore = lastHistory?.balance_after || 0;
      const finalBalance = balanceBefore + adjustedAmount;

      if (finalBalance < 0)
        return res.status(400).json({ message: `${category} tidak cukup` });

      // Buat record adjust
      const adjust = await Adjust.create({
        username,
        amount: adjustedAmount,
        type,
        category,
        remarks,
        createdby: adminUsername,
        createdon: new Date(),
      });

      // Tentukan transaction_type_id
      let transactionTypeId = null;
      if (category === 'saldo')
        transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.adjust_plus : TRANSACTION_TYPE_IDS.adjust_minus;
      if (category === 'point')
        transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.point_plus : TRANSACTION_TYPE_IDS.point_minus;
      if (category === 'stamp')
        transactionTypeId = adjustedAmount > 0 ? TRANSACTION_TYPE_IDS.stamp_plus : TRANSACTION_TYPE_IDS.stamp_minus;

      // Simpan ke WalletHistory
      await WalletHistory.create({
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
        wallet_type_id: WALLET_TYPE_IDS[category],
      });

      // Update point/stamp di Customer
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
          [Op.between]: [new Date(fromDate), new Date(new Date(toDate).setHours(23, 59, 59, 999))],
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
          [Op.between]: [new Date(fromDate), new Date(new Date(toDate).setHours(23, 59, 59, 999))],
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

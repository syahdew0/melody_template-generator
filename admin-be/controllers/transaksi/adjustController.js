const { Adjust, Customer, Wallet, WalletHistory } = require('../../models');
const { Op } = require('sequelize');


module.exports = {
  async create(req, res) {
    try {
      const { username, amount, type, remarks } = req.body;
      const adminUsername = req.user?.username || 'system';

      // Validasi
      if (!username || !amount || !type) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      if (amount <= 0) {
        return res.status(400).json({ message: 'Nominal tidak boleh <= 0' });
      }

      if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ message: 'Tipe hanya boleh "in" atau "out"' });
      }

      // Ambil customer & wallet
      const customer = await Customer.findOne({ where: { username } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer tidak ditemukan' });
      }

      const wallet = await Wallet.findOne({ where: { customer_id: customer.id } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      // Hitung saldo terakhir dari wallet history
      const lastHistory = await WalletHistory.findOne({
        where: { walletId: wallet.id },
        order: [['created_at', 'DESC']],
      });

      const balanceBefore = lastHistory?.balance_after || 0;
      const adjAmount = parseFloat(amount);

      let finalBalance = balanceBefore;
      if (type === 'in') {
        finalBalance += adjAmount;
      } else {
        if (finalBalance < adjAmount) {
          return res.status(400).json({ message: 'Saldo tidak mencukupi' });
        }
        finalBalance -= adjAmount;
      }

      // Simpan ke Adjust
      const adjust = await Adjust.create({
        username,
        amount: adjAmount,
        type,
        walletid: wallet.id,
        remarks,
        createdby: adminUsername,
        createdon: new Date(),
      });

      // Simpan ke WalletHistory
      await WalletHistory.create({
        walletId: wallet.id,
        username,
        transaction_type: type === 'in' ? 'adjust_plus' : 'adjust_minus',
        source_type: 'adjust',
        source_id: adjust.id,
        amount: type === 'in' ? adjAmount : -adjAmount,
        balance_before: balanceBefore,
        balance_after: finalBalance,
        balance: finalBalance,
        remarks,
        createdby: adminUsername,
        created_at: new Date(),
      });

      // Update saldo terakhir wallet
      // await Wallet.update(
      //   { balance: finalBalance },
      //   { where: { id: wallet.id } }
      // );

      return res.json({ message: 'Penyesuaian berhasil', data: adjust });

    } catch (error) {
      console.error('Gagal membuat adjust:', error);
      return res.status(500).json({ message: 'Gagal membuat adjust', error });
    }
  },

  async list(req, res) {
    try {
      const { username, startDate, endDate, page = 1, limit = 10 } = req.query;

      const whereClause = {};

      if (username) {
        whereClause.username = username;
      }

      if (startDate && endDate) {
        whereClause.createdon = {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        };
      }

      const offset = (parseInt(page) - 1) * parseInt(limit);

      const { rows, count } = await Adjust.findAndCountAll({
        where: whereClause,
        order: [['createdon', 'DESC']],
        offset,
        limit: parseInt(limit)
      });

      res.json({
        data: rows,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        totalItems: count
      });
    } catch (error) {
      console.error('Gagal mengambil data adjust:', error);
      res.status(500).json({ message: 'Gagal mengambil data adjust', error });
    }
  },

async getAdjustSummary(req, res) {
  try {
    const { username, startDate, endDate } = req.query;

    const whereClause = {};

    if (username) {
      whereClause.username = username;
    }

    if (startDate && endDate) {
      whereClause.createdon = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    const [inResult, outResult] = await Promise.all([
      Adjust.sum('amount', { where: { ...whereClause, type: 'in' } }),
      Adjust.sum('amount', { where: { ...whereClause, type: 'out' } }),
    ]);

    res.json({
      total: {
        in: inResult || 0,
        out: outResult || 0,
        net: (inResult || 0) - (outResult || 0)
      }
    });
  } catch (err) {
    console.error('Error fetching adjust summary:', err);
    res.status(500).json({ message: 'Gagal mengambil data summary adjust.' });
  }
}
};
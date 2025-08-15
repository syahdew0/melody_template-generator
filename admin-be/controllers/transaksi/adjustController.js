const { Adjust, Customer, Wallet, WalletHistory } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  async create(req, res) {
  try {
    const { username, amount, category, type, remarks } = req.body;
    const adminUsername = req.user?.username || 'system';

    if (!username || amount === undefined || !category || !type) {
      return res.status(400).json({ message: 'Data tidak lengkap' });
    }

    if (amount === 0) {
      return res.status(400).json({ message: 'Jumlah tidak boleh nol' });
    }

    if (!['saldo', 'point', 'stamp'].includes(category)) {
      return res.status(400).json({ message: 'Category harus salah satu dari saldo, point, atau stamp' });
    }

    if (!['in', 'out'].includes(type)) {
      return res.status(400).json({ message: 'Type harus salah satu dari in atau out' });
    }

    const customer = await Customer.findOne({ where: { username } });
    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }

    const adjustedAmount = type === 'out' ? -Math.abs(amount) : Math.abs(amount);

    if (category === 'saldo') {
      // SALDO
      const wallet = await Wallet.findOne({ where: { customer_id: customer.id } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      const lastHistory = await WalletHistory.findOne({
        where: { walletId: wallet.id },
        order: [['created_at', 'DESC']],
      });

      const balanceBefore = lastHistory?.balance_after || 0;
      const finalBalance = balanceBefore + adjustedAmount;

      // if (finalBalance < 0) {
      //   return res.status(400).json({ message: 'Saldo tidak boleh negatif' });
      // }

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

      const transactionType = adjustedAmount > 0 ? 'adjust_plus' : 'adjust_minus';

      await WalletHistory.create({
        walletId: wallet.id,
        username,
        transaction_type: transactionType,
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

      await Wallet.update({ balance: finalBalance }, { where: { id: wallet.id } });

      return res.json({ message: 'Penyesuaian saldo berhasil', data: adjust });

    } else {
      // POINT & STAMP
const lastHistory = await WalletHistory.findOne({
  where: { username, wallet_type: category },
  order: [['created_at', 'DESC']],
});

const balanceBefore = lastHistory?.balance_after || 0;
const finalBalance = balanceBefore + adjustedAmount;

// Tambahkan pengecekan
if (finalBalance < 0) {
  return res.status(400).json({ message: `${category} tidak cukup` });
}

const adjust = await Adjust.create({
  username,
  amount: adjustedAmount,
  type,
  category,
  walletid: null,
  remarks,
  createdby: adminUsername,
  createdon: new Date(),
});

if (category === 'point') {
  await customer.update({ point: finalBalance });
} else {
  await customer.update({ stamp: finalBalance });
}

const dummyWalletId = 0;
let transactionType = '';
if (category === 'point') {
  transactionType = adjustedAmount > 0 ? 'point_plus' : 'point_minus';
} else if (category === 'stamp') {
  transactionType = adjustedAmount > 0 ? 'stamp_plus' : 'stamp_minus';
}

await WalletHistory.create({
  walletId: dummyWalletId,
  username,
  transaction_type: transactionType,
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

return res.json({ message: `Penyesuaian ${category} berhasil`, data: adjust });

    }
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

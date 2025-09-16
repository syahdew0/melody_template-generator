const { Withdraw, Customer, Wallet, Adjust, WalletHistory, Topup, TransactionType, WalletType,MlmRegistration, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { getWallet } = require('../../services/walletServices');

exports.getMyWallet = async (req, res) => {
  try {
    const username = req.customer.username;

    // Ambil semua wallet_type_id unik user dari WalletHistory
    const walletTypes = await WalletHistory.findAll({
      where: { username },
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('wallet_type_id')), 'wallet_type_id']],
      raw: true
    });

    const wallets = [];
    for (const w of walletTypes) {
      const balance = await getWallet(username, w.wallet_type_id);
      wallets.push({ wallet_type_id: w.wallet_type_id, balance });
    }

    res.json({ wallets });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil wallet', error: err.message });
  }
};
exports.getMyTotalBalance = async (req, res) => {
  try {
    const username = req.customer.username;

    // Semua wallet_type user
    const walletTypes = await WalletHistory.findAll({
      where: { username },
      attributes: [[ 'wallet_type_id', 'wallet_type_id' ]],
      group: ['wallet_type_id'],
      raw: true
    });

    let totalBalance = 0;

    for (const w of walletTypes) {
      totalBalance += await getWallet(username, w.wallet_type_id);
    }

    // Tambahkan Adjust kategori yang belum ada
    const adjustTotals = await Adjust.findAll({
      where: { username },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category'],
      raw: true
    });

    for (const a of adjustTotals) {
      const walletType = await WalletType.findOne({ where: { name: a.category } });
      if (!walletType) continue;

      if (!walletTypes.find(w => w.wallet_type_id === walletType.id)) {
        totalBalance += parseFloat(a.total || 0);
      }
    }

    res.json({ total_balance: totalBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil total balance', error: err.message });
  }
};


exports.getMyWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transaction_type, wallet_id, page = 1, limit = 15 } = req.query;
    const username = req.customer.username; // ambil username dari user login

    const where = { username }; // hanya data user login
    if (transaction_type) where.transaction_type_id = transaction_type;

    if (fromDate && toDate) {
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      where.created_at = { [Op.between]: [start, end] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await WalletHistory.findAndCountAll({
      where,
      include: [
        {
          model: TransactionType,
          as: 'transaction_type_data',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'id', 'username', 'reference_id', 'wallet_type_id',
        'transaction_type_id', 'status',
        'amount', 'balance_before', 'balance_after', 'remarks', 'created_at'
      ],
     order: [
  ['created_at', 'DESC'],
  [sequelize.literal(`CASE
    WHEN transaction_type_id = 14 THEN 1
    WHEN transaction_type_id = 15 THEN 2
    WHEN transaction_type_id = 16 THEN 3
    ELSE 4
  END`), 'ASC']
],

      offset,
      limit: parseInt(limit),
    });

    const typeMap = {
      1: 'topup', 2: 'withdraw', 3: 'withdraw_dibatalkan', 4: 'withdraw_ditolak',
      5: 'adjust_plus', 6: 'adjust_minus', 7: 'point_plus', 8: 'point_minus',
      9: 'stamp_plus', 10: 'stamp_minus', 11: 'order', 12: 'order_ditolak',
      13: 'order_dibatalkan', 14: 'mlm_join', 15: 'referral_bonus', 16: 'matching_bonus'
    };

    const rows = result.rows.map(r => {
      const wallet_type_id = r.wallet_type_id ?? (
        r.transaction_type_id === 7 || r.transaction_type_id === 8 ? 2 :
        r.transaction_type_id === 9 || r.transaction_type_id === 10 ? 3 : 1
      );

      return {
        ...r.toJSON(),
        transaction_type: typeMap[r.transaction_type_id] || '-',
        wallet_type_id
      };
    });

    res.json({
      count: result.count,
      rows
    });

  } catch (err) {
    console.error('My Wallet History Error:', err);
    res.status(500).json({ message: 'Gagal mengambil riwayat wallet' });
  }
};


exports.getAdminWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transaction_type, username, wallet_id, page = 1, limit = 15 } = req.query;

    const where = {};
    if (username) where.username = username;
    if (transaction_type) where.transaction_type_id = transaction_type;

    if (fromDate && toDate) {
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      where.created_at = { [Op.between]: [start, end] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await WalletHistory.findAndCountAll({
      where,
      include: [
        {
          model: TransactionType,
          as: 'transaction_type_data',
          attributes: ['id', 'name']
        }
      ],
      attributes: [
        'id',  'username', 'reference_id', 'wallet_type_id',
        'transaction_type_id', 'status',
        'amount', 'balance_before', 'balance_after', 'remarks', 'created_at'
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    res.json({
      count: result.count,
      rows: result.rows
    });

  } catch (err) {
    console.error('Admin Wallet History Error:', err);
    res.status(500).json({ message: 'Gagal mengambil riwayat wallet' });
  }
};

exports.getWalletUsernames = async (req, res) => {
  try {
    const { fromDate, toDate, username } = req.query;
    const where = {};

    if (fromDate && toDate) {
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      where.created_at = {
        [Op.between]: [start, end]
      };
    }

    if (username) {
      where.username = username;
    }

    const usernames = await WalletHistory.findAll({
      where,
      attributes: [
        [sequelize.fn('DISTINCT', sequelize.col('username')), 'username'],
      ],
      order: [['username', 'ASC']],
      raw: true,
    });

    res.json(usernames.map(u => u.username));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil username' });
  }
};

exports.getAdminMlmTransactions = async (req, res) => {
  try {
    const { fromDate, toDate, username, page = 1, limit = 15 } = req.query;
    const { Op } = require("sequelize");

    const where = { transaction_type_id: [ 15, 16] }; // hanya MLM
    if (username) where.username = username;

    if (fromDate && toDate) {
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      where.created_at = { [Op.between]: [start, end] };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await WalletHistory.findAndCountAll({
      where,
      include: [
        {
          model: TransactionType,
          as: 'transaction_type_data',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    // mapping supaya "to" = username penerima
    const rows = await Promise.all(result.rows.map(async r => {
      let toUser = '-';

      if ([15,16].includes(r.transaction_type_id) && r.reference_id) {
        const refCustomer = await Customer.findOne({
          where: { id: r.reference_id },
          attributes: ['username']
        });
        toUser = refCustomer ? refCustomer.username : '-';
      }

      return {
        date: new Date(r.created_at).toLocaleString(),
        type: r.transaction_type_data?.name || r.transaction_type_id,
        amount: r.amount,
        from: r.username,
        to: toUser,
        remarks: r.remarks,
        transferred: r.transferred ? "Ya" : "Tidak",
        received: r.received ? "Ya" : "Tidak"
      };
    }));

    res.json({
      count: result.count,
      rows
    });

  } catch (err) {
    console.error('Admin MLM Transactions Error:', err);
    res.status(500).json({ message: 'Gagal mengambil transaksi MLM' });
  }
};
// exports.getDailyBalance = async (req, res) => {
//   try {
//     const { fromDate, toDate } = req.query;
//     const userId = req.customer.id;

//     const balances = await getDailyBalance(userId, fromDate, toDate);

//     res.json(balances);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
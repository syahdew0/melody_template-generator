const { Withdraw, Customer, Wallet, Adjust, WalletHistory, Topup, TransactionType, sequelize } = require('../../models');
const { Op } = require('sequelize');
const { getWallet } = require('../../services/walletServices');

exports.getMyWallet = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const username = req.customer.username;

    // ambil semua wallet user
    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      raw: true,
    });

    // pakai service getWallet untuk setiap walletType
    const enrichedWallets = await Promise.all(wallets.map(w =>
      getWallet(customerId, w.wallet_type, username)
    ));

    // tambahkan kategori dari Adjust yang belum ada wallet
    const adjustBalances = await Adjust.findAll({
      where: { username },
      attributes: ['category', [sequelize.fn('SUM', sequelize.col('amount')), 'total']],
      group: ['category'],
      raw: true
    });

    adjustBalances.forEach(a => {
      if (!wallets.find(w => w.wallet_type === a.category)) {
        enrichedWallets.push({
          id: null,
          customer_id: customerId,
          wallet_type: a.category,
          balance: parseFloat(a.total || 0),
          balance_source: 'adjusts'
        });
      }
    });

    res.json({ wallets: enrichedWallets });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data wallet' });
  }
};

exports.getMyTotalBalance = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const username = req.customer.username;

    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      attributes: ['wallet_type'],
      raw: true,
    });

    let totalBalance = 0;

    for (const w of wallets) {
      const wallet = await getWallet(customerId, w.wallet_type, username);
      totalBalance += wallet.balance;
    }

    return res.json({ total_balance: totalBalance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengambil total balance' });
  }
};

exports.getMyWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transaction_type, username, wallet_id, page = 1, limit = 15 } = req.query;

    const where = {};
    if (wallet_id) where.walletId = wallet_id;
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
        'id', 'walletId', 'username', 'reference_id', 'wallet_type',
        'transaction_type_id', 'status',
        'amount', 'balance_before', 'balance_after', 'remarks', 'created_at'
      ],
      order: [['created_at', 'DESC']],
      offset,
      limit: parseInt(limit),
    });

    // Format supaya frontend mudah pakai
    const rows = result.rows.map(r => ({
      ...r.toJSON(),
      transaction_type_name: r.transaction_type_data?.name || null
    }));

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

    if (wallet_id) where.walletId = wallet_id;
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
        'id', 'walletId', 'username', 'reference_id', 'wallet_type',
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


// Halaman history pages
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
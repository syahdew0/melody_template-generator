const {Withdraw, Customer, Wallet, Adjust, WalletSummary, WalletHistory, Topup,sequelize, } = require('../../models');
const { Op } = require('sequelize');

exports.getMyWallet = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      raw: true,
    });

    const walletIds = wallets.map((w) => w.id);

    const lastHistories = await WalletHistory.findAll({
      where: {
        walletId: { [Op.in]: walletIds },
        status: 'success',
      },
      attributes: [
        'walletId',
        [sequelize.fn('MAX', sequelize.col('created_at')), 'latest'],
        'balance_after',
      ],
      group: ['walletId', 'balance_after'],
      raw: true,
    });

    const balanceMap = {};
    for (const h of lastHistories) {
      balanceMap[h.walletId] = h.balance_after;
    }

    // Ambil balance dari adjusts (untuk kategori tanpa wallet)
    const adjustBalances = await Adjust.findAll({
      where: { username: req.customer.username },
      attributes: [
        'category',
        [sequelize.fn('SUM', sequelize.col('amount')), 'total']
      ],
      group: ['category'],
      raw: true
    });

    const adjustMap = {};
    adjustBalances.forEach(a => {
      adjustMap[a.category] = parseFloat(a.total || 0);
    });

    // Gabungkan
    const enrichedWallets = wallets.map((w) => {
      return {
        ...w,
        balance: balanceMap[w.id] || adjustMap[w.wallet_type] || 0,
        balance_source: balanceMap[w.id] ? 'wallet_history_latest' : 'adjusts',
      };
    });

    // Tambahkan kategori dari adjusts yang belum punya wallet
    ['point', 'stamp'].forEach(cat => {
      if (!wallets.find(w => w.wallet_type === cat) && adjustMap[cat] !== undefined) {
        enrichedWallets.push({
          id: null,
          customer_id: customerId,
          wallet_type: cat,
          balance: adjustMap[cat],
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

    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      attributes: ['id'],
      raw: true,
    });

    const walletIds = wallets.map(w => w.id);

    if (walletIds.length === 0) {
      return res.json({ total_balance: 0 });
    }

    // Ambil history terakhir per wallet
    const latestHistories = await Promise.all(
      walletIds.map(async (walletId) => {
        return await WalletHistory.findOne({
          where: {
            walletId,
            status: 'success',
          },
          order: [['created_at', 'DESC']],
          attributes: ['balance_after'],
          raw: true,
        });
      })
    );
    const totalBalance = latestHistories.reduce((acc, h) => acc + (h?.balance_after || 0), 0);

    return res.json({ total_balance: totalBalance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Gagal mengambil total balance' });
  }
};

exports.getWalletDetailsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const customerId = req.customer.id;

    const wallet = await Wallet.findOne({
      where: { customer_id: customerId, wallet_type: type },
      raw: true,
    });

    if (!wallet) {
      return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    }

    // Ambil riwayat terakhir
    const latestHistory = await WalletHistory.findOne({
      where: { walletId: wallet.id, status: 'success' },
      order: [['created_at', 'DESC']],
      raw: true,
    });

    const latestBalance = latestHistory?.balance_after || 0;

    // Ambil riwayat transaksi
    const [history, adjusts, topups, withdraws] = await Promise.all([
      // WalletHistory.findAll({
      //   where: { walletId: wallet.id },
      //   order: [['created_at', 'DESC']],
      // }),
      WalletHistory.findAll({
        where: { walletId: wallet.id },
        order: [['created_at', 'DESC']],
       attributes: ['id', 'walletId', 'username', 'transaction_type', 'reference_id', 'balance_before', 'amount', 'balance_after', 'remarks', 'status', 'created_at'],
      }),
      Adjust.findAll({
        where: { walletid: wallet.id },
        order: [['createdon', 'DESC']],
      }),
      Topup.findAll({
        where: { walletid: wallet.id },
        order: [['createdon', 'DESC']],
      }),
      Withdraw.findAll({
        where: { walletid: wallet.id },
        order: [['createdon', 'DESC']],
      }),
    ]);

    res.json({wallet,latest_balance: latestBalance, history, adjusts, topups, withdraws,});
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil detail wallet' });
  }
};

exports.getMyWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transactionType, page = 1, limit = 10 } = req.query;
    const customerId = req.customer.id;

    // Ambil semua wallet customer
    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      attributes: ['id', 'wallet_type'],
      raw: true,
    });
    const walletIds = wallets.map(w => w.id);

    // Ambil WalletHistory biasa
    const whereHistory = {
      walletId: walletIds.length ? { [Op.in]: walletIds } : undefined,
      ...(fromDate && toDate
        ? { created_at: { [Op.between]: [new Date(fromDate+'T00:00:00'), new Date(toDate+'T23:59:59')] } }
        : {}),
      ...(transactionType ? { transaction_type: transactionType } : {})
    };
    const walletHistories = await WalletHistory.findAll({
      where: whereHistory,
      order: [['created_at', 'ASC']], // urut ascending supaya saldo kumulatif bisa dihitung
      raw: true
    });

    // Ambil Adjust untuk kategori point/stamp
    const whereAdjust = { username: req.customer.username };
    if(fromDate && toDate) whereAdjust.createdon = { [Op.between]: [new Date(fromDate+'T00:00:00'), new Date(toDate+'T23:59:59')] };

    const adjustData = await Adjust.findAll({
      where: whereAdjust,
      order: [['createdon', 'ASC']], // ascending supaya saldo kumulatif bisa dihitung
      raw: true
    });

    // Hitung saldo kumulatif untuk point/stamp
   const runningBalance = { point: 0, stamp: 0 };
   const adjustHistories = adjustData.map(a => {
    const category = a.category; // point / stamp
    const before = runningBalance[category] || 0;
    runningBalance[category] = before + a.amount;
    return {
      id: `adj-${a.id}`,
      walletId: null,
      username: req.customer.username,
      reference_id: null,
      wallet_type: category,
      transaction_type: a.amount > 0 ? 'adjust_plus' : 'adjust_minus',
      status: 'success',
      amount: a.amount,
      balance_before: before,
      balance_after: runningBalance[category],
      remarks: a.remarks,
      created_at: a.createdon
    };
  });
    // Gabungkan & urutkan descending
    let allHistories = [...walletHistories, ...adjustHistories];
    allHistories.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

    // Pagination manual
    const totalCount = allHistories.length;
    const offset = (page-1)*limit;
    const paginatedData = allHistories.slice(offset, offset+parseInt(limit));

    res.json({ count: totalCount, rows: paginatedData });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message:'Gagal mengambil riwayat wallet' });
  }
};

exports.getAdminWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transaction_type, username, wallet_id, page = 1, limit = 15 } = req.query;

    const where = {};

    if (wallet_id) {
      where.walletId = wallet_id;
    }

    if (username) {
      where.username = username;
    }

    if (transaction_type) {
      where.transaction_type = transaction_type;
    }

    if (fromDate && toDate) {
      const start = new Date(fromDate + 'T00:00:00');
      const end = new Date(toDate + 'T23:59:59');
      where.created_at = {
        [Op.between]: [start, end],
      };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    // const result = await WalletHistory.findAndCountAll({
    //   where,
    //   order: [['created_at', 'DESC']],
    //   offset,
    //   limit: parseInt(limit),
    //   raw: true,
      
    // });
const result = await WalletHistory.findAndCountAll({
    where,
    attributes: [
    'id', 'walletId', 'username', 'reference_id', 'wallet_type', 'transaction_type', 'status',
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

// belum digunakan ygy
exports.getMyDailyWallets = async (req, res) => {
  try {
    const customerId = req.customer.id;

    // Ambil semua wallet user
    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      attributes: ['id', 'wallet_type'],
      raw: true,
    });

    const walletIds = wallets.map(w => w.id);
    const walletMap = Object.fromEntries(wallets.map(w => [w.id, w.wallet_type]));

    const { fromDate, toDate, walletId } = req.query;

    const where = {
      username: req.customer.username,
    };

    if (walletId) {
      where.wallet_id = walletId;
    } else if (walletIds.length > 0) {
      where.wallet_id = { [Op.in]: walletIds };
    }

    if (fromDate && toDate) {
      where.daily_date = {
        [Op.between]: [fromDate, toDate]
      };
    }

    const result = await UserDailyWallet.findAll({
      where,
      order: [['daily_date', 'DESC']],
      raw: true,
    });

    const data = result.map(row => ({
      ...row,
      wallet_type: walletMap[row.wallet_id] || null
    }));

    res.json({ rows: data });
  } catch (err) {
    console.error('Error getMyDailyWallets:', err);
    res.status(500).json({ message: 'Gagal mengambil data saldo harian' });
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
      where.username = username; // exact match tanpa LOWER
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



const {Withdraw, Customer, Wallet, Adjust, WalletSummary, WalletHistory, Topup,sequelize, } = require('../../models');
const { Op } = require('sequelize');

exports.getMyWallet = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      raw: true,
    });

    // if (!wallets || wallets.length === 0) {
    //   return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    // }

    const walletIds = wallets.map((w) => w.id);

    // Ambil history terakhir per wallet
    const lastHistories = await WalletHistory.findAll({
      where: {
        walletId: { [Op.in]: walletIds },
        status: 'success',
      },
      attributes: [
        'walletId',
        'balance_after',
        [sequelize.fn('MAX', sequelize.col('created_at')), 'latest']
      ],
      group: ['walletId'],
      raw: true,
    });

    // Buat map balance
    const balanceMap = {};
    for (const h of lastHistories) {
      balanceMap[h.walletId] = h.balance_after;
    }

    const enrichedWallets = wallets.map((w) => {
      return {
        ...w,
        balance: balanceMap[w.id] || 0,
        balance_source: 'wallet_history_latest',
      };
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

    res.json({
      wallet,
      latest_balance: latestBalance,
      history,
      adjusts,
      topups,
      withdraws,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil detail wallet' });
  }
};

exports.getMyWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transactionType } = req.query;
    const customerId = req.customer.id;

    // Ambil wallet milik customer
    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      attributes: ['id'],
      raw: true,
    });

    const walletIds = wallets.map(w => w.id);
    if (walletIds.length === 0) return res.json([]);

    const where = {
      walletId: { [Op.in]: walletIds },
    };

    if (fromDate && toDate) {
      where.created_at = {
        [Op.between]: [new Date(fromDate), new Date(toDate)],
      };
    }

    if (transactionType) {
      where.transaction_type = transactionType;
    }

    const histories = await WalletHistory.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    res.json(histories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil riwayat wallet' });
  }
};


exports.getAdminWalletHistory = async (req, res) => {
  try {
    const { fromDate, toDate, transactionType, username, wallet_id } = req.query;

    const where = {};

    if (wallet_id) {
      where.walletId = wallet_id;
    }

    if (username) {
      where.username = username;
    }

    if (transactionType) {
      where.transaction_type = transactionType;
    }

    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999); 

      where.created_at = {
        [Op.between]: [start, end],
      };
    }

    const histories = await WalletHistory.findAll({
      where,
      order: [['created_at', 'DESC']],
      raw: true,
    });

    res.json({ histories });
  } catch (err) {
    console.error('Admin Wallet History Error:', err);
    res.status(500).json({ message: 'Gagal mengambil riwayat wallet (admin)' });
  }
};

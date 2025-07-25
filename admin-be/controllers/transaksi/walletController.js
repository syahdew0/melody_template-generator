const {Withdraw, Customer, Wallet, Adjust, WalletSummary, WalletHistory, Topup,sequelize, } = require('../../models');
const { Op } = require('sequelize');

exports.getMyWallet = async (req, res) => {
  try {
    const customerId = req.customer.id;

    const wallets = await Wallet.findAll({
      where: { customer_id: customerId },
      raw: true,
    });

    if (!wallets || wallets.length === 0) {
      return res.status(404).json({ message: 'Wallet tidak ditemukan' });
    }

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
      WalletHistory.findAll({
        where: { walletId: wallet.id },
        order: [['created_at', 'DESC']],
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

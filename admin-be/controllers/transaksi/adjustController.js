const { Adjust, Customer, Wallet, WalletHistory } = require('../../models');

module.exports = {
  async create(req, res) {
    try {
      const { username, amount, type, remarks } = req.body;
      const adminUsername = req.user?.username || 'system';

      // Validasi input
      if (!username || !amount || !type) {
        return res.status(400).json({ message: 'Data tidak lengkap' });
      }

      if (amount <= 0) {
        return res.status(400).json({ message: 'Nominal tidak boleh <= 0' });
      }

      if (!['in', 'out'].includes(type)) {
        return res.status(400).json({ message: 'Tipe hanya boleh "in" atau "out"' });
      }

      // Cari customer dan wallet
      const customer = await Customer.findOne({ where: { username } });
      if (!customer) {
        return res.status(404).json({ message: 'Customer tidak ditemukan' });
      }

      const wallet = await Wallet.findOne({ where: { customer_id: customer.id } });
      if (!wallet) {
        return res.status(404).json({ message: 'Wallet tidak ditemukan' });
      }

      // Hitung saldo terakhir dari wallet history
      const lastBalance = await WalletHistory.sum('amount', {
        where: { wallet_id: wallet.id },
      }) || 0;

      const adjAmount = parseFloat(amount);
      let finalBalance = lastBalance;

      if (type === 'in') {
        finalBalance += adjAmount;
      } else if (type === 'out') {
        if (finalBalance < adjAmount) {
          return res.status(400).json({ message: 'Saldo tidak mencukupi' });
        }
        finalBalance -= adjAmount;
      }

      // Simpan ke tabel Adjust
      const adjust = await Adjust.create({
        username,
        amount: adjAmount,
        type,
        walletid: wallet.id,
        remarks,
        createdby: adminUsername,
      });

      // Simpan ke WalletHistory
      await WalletHistory.create({
        wallet_id: wallet.id,
        source_type: 'adjust',
        source_id: adjust.id,
        amount: type === 'in' ? adjAmount : -adjAmount,
        balance: finalBalance,
        remarks,
        createdby: adminUsername,
      });

      return res.json({ message: 'Penyesuaian berhasil', data: adjust });
    } catch (error) {
      console.error('Gagal membuat adjust:', error);
      return res.status(500).json({ message: 'Gagal membuat adjust', error });
    }
  },

  async list(req, res) {
    try {
      const data = await Adjust.findAll({
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Wallet,
            as: 'wallet',
            attributes: ['id'],
          },
        ],
        order: [['createdon', 'DESC']],
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data adjust', error });
    }
  },
};

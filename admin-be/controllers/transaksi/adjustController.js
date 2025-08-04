const { Adjust, Customer, Wallet, WalletHistory } = require('../../models');

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
      const data = await Adjust.findAll({
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'username', 'email'],
          },
          // {
          //   model: WalletHistory,
          //   as: 'walletHistory',
          //   attributes: ['id'],
          // },
        ],
        order: [['createdon', 'DESC']],
      });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: 'Gagal mengambil data adjust', error });
    }
  },
};

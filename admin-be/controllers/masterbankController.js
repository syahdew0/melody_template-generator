const { Bank } = require('../models');

exports.getPublicBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({
      where: { status: 'active' },
      order: [['name', 'ASC']],
      attributes: ['id', 'name']
    });
    res.json({ data: banks });
  } catch (err) {
    console.error('Gagal mengambil bank:', err);
    res.status(500).json({ message: 'Gagal mengambil daftar bank' });
  }
};

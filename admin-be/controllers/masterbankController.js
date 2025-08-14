const { Bank } = require('../models');

exports.getPublicBanks = async (req, res) => {
  try {
    const banks = await Bank.findAll({
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'status']
    });
    res.json({ data: banks });
  } catch (err) {
    console.error('Gagal mengambil bank:', err);
    res.status(500).json({ message: 'Gagal mengambil daftar bank' });
  }
};

// Tambah bank baru
exports.createBank = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ message: 'Nama bank wajib diisi' });

    const bank = await Bank.create({ name, status: status || 'active' });
    res.json({ message: 'Bank berhasil ditambahkan', data: bank });
  } catch (err) {
    console.error('Gagal membuat bank:', err);
    res.status(500).json({ message: 'Gagal membuat bank' });
  }
};

// Update bank
exports.updateBank = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    const bank = await Bank.findByPk(id);
    if (!bank) return res.status(404).json({ message: 'Bank tidak ditemukan' });

    bank.name = name || bank.name;
    bank.status = status || bank.status;
    await bank.save();

    res.json({ message: 'Bank berhasil diupdate', data: bank });
  } catch (err) {
    console.error('Gagal mengupdate bank:', err);
    res.status(500).json({ message: 'Gagal mengupdate bank' });
  }
};

// Hapus bank
exports.deleteBank = async (req, res) => {
  try {
    const { id } = req.params;

    const bank = await Bank.findByPk(id);
    if (!bank) return res.status(404).json({ message: 'Bank tidak ditemukan' });

    await bank.destroy();
    res.json({ message: 'Bank berhasil dihapus' });
  } catch (err) {
    console.error('Gagal menghapus bank:', err);
    res.status(500).json({ message: 'Gagal menghapus bank' });
  }
};

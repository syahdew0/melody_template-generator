const { CompanyBank, Topup } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const banks = await CompanyBank.findAll({ order: [['bank_name', 'ASC']] });
    res.json({ data: banks }); // pakai format { data: ... } sesuai frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data bank perusahaan' });
  }
};

exports.create = async (req, res) => {
  try {
    const { bank_name, account_name, account_number } = req.body;
    if (!bank_name || !account_name || !account_number) {
      return res.status(400).json({ message: 'Semua field wajib diisi' });
    }

    const bank = await CompanyBank.create({ bank_name, account_name, account_number });
    res.status(201).json({ data: bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal membuat data bank' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { bank_name, account_name, account_number } = req.body;

    const bank = await CompanyBank.findByPk(id);
    if (!bank) {
      return res.status(404).json({ message: 'Bank tidak ditemukan' });
    }

    await bank.update({ bank_name, account_name, account_number });
    res.json({ data: bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengupdate data bank' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const bank = await CompanyBank.findByPk(id);
    if (!bank) {
      return res.status(404).json({ message: 'Bank tidak ditemukan' });
    }

    // Cek apakah masih ada topup yang pakai bank ini
    const topupCount = await Topup.count({ where: { bank_id: id } });
    if (topupCount > 0) {
      return res.status(400).json({ 
        message: `Bank masih digunakan di ${topupCount} topup, tidak bisa dihapus` 
      });
    }

    // Hapus bank
    await bank.destroy();
    res.json({ message: 'Data bank berhasil dihapus' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menghapus data bank' });
  }
};

// Nonaktifkan bank (soft delete)
exports.deactivate = async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await CompanyBank.findByPk(id);
    if (!bank) return res.status(404).json({ message: 'Bank tidak ditemukan' });

    await bank.update({ is_active: false });
    res.json({ message: 'Bank dinonaktifkan', data: bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal menonaktifkan bank' });
  }
};

// Aktifkan kembali bank
exports.activate = async (req, res) => {
  try {
    const { id } = req.params;
    const bank = await CompanyBank.findByPk(id);
    if (!bank) return res.status(404).json({ message: 'Bank tidak ditemukan' });

    await bank.update({ is_active: true });
    res.json({ message: 'Bank diaktifkan kembali', data: bank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengaktifkan bank' });
  }
};

exports.getActiveBanksForCustomer = async (req, res) => {
  try {
    const banks = await CompanyBank.findAll({
      where: { is_active: true }, // hanya bank aktif
      order: [['bank_name', 'ASC']]
    });
    res.json({ data: banks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil daftar bank aktif' });
  }
};

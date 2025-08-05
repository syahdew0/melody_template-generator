const { CompanyBank } = require('../models');

exports.getAll = async (req, res) => {
  try {
    const banks = await CompanyBank.findAll({ order: [['bank_name', 'ASC']] });
    res.json({ data: banks }); // pakai format { data: ... } sesuai frontend
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data bank perusahaan' });
  }
};

const { CompanyBank } = require('../../models');

exports.getAll = async (req, res) => {
  try {
    const banks = await CompanyBank.findAll({
      order: [['bank_name', 'ASC']]
    });
    res.json({ data: banks }); // format { data: ... } agar frontend konsisten
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil data bank perusahaan' });
  }
};

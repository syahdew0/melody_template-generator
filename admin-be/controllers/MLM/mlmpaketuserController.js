// controllers/MLM/mlmpaketuserController.js
const { MlmRegistration, Customer, MLMPackage } = require('../../models');

exports.getJoinMLMTransactions = async (req, res) => {
  try {
    const regs = await MlmRegistration.findAll({
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'username', 'email'] },
        { model: MLMPackage, as: 'package', attributes: ['MLMPackageID', 'MLMPackageName'] },
        { model: Customer, as: 'upline', attributes: ['id', 'username'] },
        { model: Customer, as: 'referrer', attributes: ['id', 'username'] },
      ],
      order: [['created_at', 'DESC']],
    });

    const formatted = regs.map((r) => ({
      id: r.id,
      username: r.customer?.username || '-',
      package: r.package?.MLMPackageName || '-',
      upline: r.upline?.username || '-',
      referrer: r.referrer?.username || '-',
      status: r.status,
      start_date: r.start_date,
      end_date: r.end_date,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Gagal ambil data paket user' });
  }
};

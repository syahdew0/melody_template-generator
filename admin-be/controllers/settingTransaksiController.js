const { Setting } = require('../models');

// Ambil semua setting transaksi (min/max topup & withdraw)
exports.getTransaksiSettings = async (req, res) => {
  try {
    // ambil semua settings yang key-nya terkait transaksi
    const settings = await Setting.findAll({
      where: {
        key: [
          'min_topup',
          'max_topup',
          'min_withdraw',
          'max_withdraw'
        ]
      }
    });
    res.json(settings); // [{key, value}, ...]
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update satu setting transaksi
exports.updateTransaksiSetting = async (req, res) => {
  try {
    const { key, value } = req.body;

    // validasi key supaya hanya 4 key ini yang boleh diupdate
    const allowedKeys = ['min_topup', 'max_topup', 'min_withdraw', 'max_withdraw'];
    if (!allowedKeys.includes(key)) {
      return res.status(400).json({ error: 'Key tidak valid untuk setting transaksi' });
    }

    let setting = await Setting.findOne({ where: { key } });
    if (setting) {
      setting.value = value;
      await setting.save();
    } else {
      setting = await Setting.create({ key, value });
    }

    res.json(setting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactionSettings = async (req, res) => {
  try {
    const keys = ['min_topup', 'max_topup', 'min_withdraw', 'max_withdraw'];
    const settings = await Settings.findAll({
      where: { key: keys }
    });

    res.json(settings); // frontend akan menerima array {key, value}
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal ambil setting transaksi' });
  }
};
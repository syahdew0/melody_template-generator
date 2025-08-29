const { Icon } = require('../models');
const path = require('path');

const DEFAULT_FAVICON = '/uploads/default-favicon.ico'; // simpan di public/uploads/

exports.getFavicon = async (req, res) => {
  try {
    const icon = await Icon.findOne({ where: { key: 'favicon' } });
    if (!icon) return res.json({ value: '/uploads/favicon.ico', apiUrl: `${req.protocol}://${req.get('host')}` });

    res.json({ value: icon.value, apiUrl: `${req.protocol}://${req.get('host')}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengambil favicon' });
  }
};


exports.setFavicon = async (req, res) => {
  const { value } = req.body;
  try {
    const [icon, created] = await Icon.findOrCreate({
      where: { key: 'favicon' },
      defaults: { value },
    });

    if (!created) {
      icon.value = value;
      await icon.save();
    }

    res.json({ message: 'Favicon saved', data: icon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to save favicon' });
  }
};

exports.uploadFavicon = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const [icon, created] = await Icon.findOrCreate({
      where: { key: 'favicon' },
      defaults: { value: fileUrl },
    });

    if (!created) {
      icon.value = fileUrl;
      await icon.save();
    }

    res.status(201).json({
      message: 'Favicon berhasil diupload dan disimpan',
      value: fileUrl,
      data: icon
    });
  } catch (err) {
    console.error('Upload favicon error:', err);
    res.status(500).json({ message: 'Gagal mengupload favicon' });
  }
};

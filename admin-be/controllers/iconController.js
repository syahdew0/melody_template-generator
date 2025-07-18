const { Icon } = require('../models');
const path = require('path');

exports.getFavicon = async (req, res) => {
  try {
    const icon = await Icon.findOne({ where: { key: 'favicon' } })
    if (!icon) return res.status(404).json({ message: 'Favicon belum diatur.' })

    res.json({ value: icon.value }) // <-- dikonsumsi di frontend
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil favicon.', error: err.message })
  }
}


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
    if (!req.file) {
      return res.status(400).json({ message: 'File tidak ditemukan' });
    }

    let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    if (process.env.NODE_ENV === 'staging') {
      fileUrl = `${req.protocol}://${req.get('host')}:8443/uploads/${req.file.filename}`;
    }

    // Simpan atau update favicon di tabel icons
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
      url: fileUrl,
      value: fileUrl,
      data: icon
    });
  } catch (err) {
    console.error('Upload favicon error:', err);
    res.status(500).json({ message: 'Gagal mengupload favicon' });
  }
};


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
  if (!req.file) return res.status(400).json({ message: 'File tidak ditemukan' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.json({
    message: 'Upload berhasil',
    url: fileUrl, 
    value: fileUrl 
  });
};

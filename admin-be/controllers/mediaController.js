const { Media } = require('../models');
const path = require('path');
const fs = require('fs');
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

exports.getAllMedia = async (req, res) => {
  try {
    const media = await Media.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(media);
  } catch (err) {
    console.error('GET media error:', err);
    res.status(500).json({ message: 'Gagal mengambil data media' });
  }
};

// exports.uploadMedia = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'Tidak ada file yang diupload' });
//     }
//     const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//     const media = await Media.create({
//       name: req.file.originalname,
//       url: fileUrl,
//       description: req.body.description || ''
//     });

//     res.status(201).json(media);
//   } catch (err) {
//     console.error('Upload error:', err);
//     res.status(500).json({ message: 'Gagal mengupload media' });
//   }
// };

exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Tidak ada file yang diupload' });
    }

    let fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    if (process.env.NODE_ENV === 'staging') {
      fileUrl = `${req.protocol}://${req.get('host')}:8443/uploads/${req.file.filename}`;
    }

    const media = await Media.create({
      name: req.file.originalname,
      url: fileUrl,
      description: req.body.description || ''
    })

    res.status(201).json(media)
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ message: 'Gagal mengupload media' })
  }
}

exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findByPk(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media tidak ditemukan' });
    }

    const filePath = path.join(uploadDir, path.basename(media.url));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await media.destroy();
    res.json({ message: 'Media berhasil dihapus' });
  } catch (err) {
    console.error('Delete media error:', err);
    res.status(500).json({ message: 'Gagal menghapus media' });
  }
};

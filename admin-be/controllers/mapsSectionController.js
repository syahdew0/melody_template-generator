const db = require('../models');
const MapsSection = db.MapsSection;

// GET single (assume only 1 record)
exports.getMapsSection = async (req, res) => {
  try {
    const data = await MapsSection.findOne({ where: { id: 1 } });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
  }
};


exports.updateMapsSection = async (req, res) => {
  try {
    const {
      title,
      description,
      mapUrl,
      mapEmbedUrl, // ← tambahkan ini
      buttonMapText,
      buttonShareText
    } = req.body;

    const section = await MapsSection.findByPk(1);
    if (!section) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await section.update({
      title,
      description,
      mapUrl,
      mapEmbedUrl, // ← tambahkan ini juga
      buttonMapText,
      buttonShareText
    });

    res.json({ message: 'Maps section berhasil diperbarui', data: section });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui data', error: err.message });
  }
};

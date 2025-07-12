const { ServiceSection } = require('../models');

// GET /api/service-list
exports.getServiceSection = async (req, res) => {
  try {
    let data = await ServiceSection.findOne({ where: { id: 1 } });
    if (!data) {
      data = await ServiceSection.create({ id: 1, title1: '', title2: '', description: '', ctaNote: '', services: [] });
    }
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
  }
};

// PUT /api/service-list
exports.updateServiceSection = async (req, res) => {
  try {
    const { title1, title2, description, ctaNote, services } = req.body;

    const [section, created] = await ServiceSection.findOrCreate({ where: { id: 1 } });

    section.title1 = title1;
    section.title2 = title2;
    section.description = description;
    section.ctaNote = ctaNote;

    section.services = typeof services === 'string' ? JSON.parse(services) : services;

    await section.save();

    res.json({ message: 'Berhasil diperbarui', data: section });
  } catch (err) {
    res.status(500).json({ message: 'Gagal memperbarui data', error: err.message });
  }
};

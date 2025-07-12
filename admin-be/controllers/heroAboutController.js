const { HeroAbout } = require('../models');

// FRONTEND: GET hero about (ambil yang pertama)
exports.getHeroAbout = async (req, res) => {
  try {
    const hero = await HeroAbout.findOne();
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data hero', error: err.message });
  }
};

// ADMIN: GET all
exports.getAll = async (req, res) => {
  try {
    const data = await HeroAbout.findAll({ order: [['id', 'DESC']] });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengambil data', error: err.message });
  }
};

// ADMIN: CREATE
exports.create = async (req, res) => {
  console.log('Data yang diterima:', req.body)
  try {
    const hero = await HeroAbout.create(req.body)
    res.status(201).json(hero)
  } catch (error) {
    console.error('Gagal menyimpan hero:', error)
    res.status(500).json({ message: 'Gagal menyimpan hero', error: error.message })
  }
}

// ADMIN: UPDATE
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { header, title, description, image } = req.body; // Tambahkan image
    const hero = await HeroAbout.findByPk(id);
    if (!hero) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await hero.update({ header, title, description, image });
    res.json(hero);
  } catch (err) {
    res.status(500).json({ message: 'Gagal mengupdate data', error: err.message });
  }
};

// ADMIN: DELETE
exports.destroy = async (req, res) => {
  try {
    const id = req.params.id;
    const hero = await HeroAbout.findByPk(id);
    if (!hero) return res.status(404).json({ message: 'Data tidak ditemukan' });

    await hero.destroy();
    res.json({ message: 'Data berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menghapus data', error: err.message });
  }
};

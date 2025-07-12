const { Op } = require('sequelize')
const Portfolio = require('../models').Portfolio

// Ambil 1 header (yang punya heading)
exports.getHeader = async (req, res) => {
  try {
    const header = await Portfolio.findOne({
      where: {
        heading: { [Op.not]: null }
      }
    });
    res.json(header);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Buat atau update header
exports.updateHeader = async (req, res) => {
  try {
    let header = await Portfolio.findOne({
      where: { heading: { [Op.not]: null } }
    });

    if (header) {
      await header.update(req.body);
    } else {
      header = await Portfolio.create(req.body);
    }

    res.json(header);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Ambil semua item gambar (tanpa heading)
exports.getItems = async (req, res) => {
  try {
    const items = await Portfolio.findAll({
      where: {
        [Op.or]: [
          { heading: null },
          { heading: '' }
        ]
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Tambah item
exports.createItem = async (req, res) => {
  try {
    const item = await Portfolio.create(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item || item.heading) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Hapus item
exports.deleteItem = async (req, res) => {
  try {
    const item = await Portfolio.findByPk(req.params.id);
    if (!item || item.heading) {
      return res.status(404).json({ message: 'Item not found' });
    }
    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

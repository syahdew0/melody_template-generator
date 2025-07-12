const db = require('../models');
const { location } = db;

exports.getAll = async (req, res) => {
  try {
    const data = await location.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const created = await location.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const [updated] = await location.update(req.body, {
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedData = await location.findByPk(req.params.id);
      res.json(updatedData);
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await location.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      res.json({ message: 'Deleted successfully' });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

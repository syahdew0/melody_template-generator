// controllers/valueSectionController.js
const { ValueItem } = require('../models')

// GET all
exports.getValues = async (req, res) => {
    try {
      const items = await ValueItem.findAll();
      res.json(items);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch values' });
    }
  };

// CREATE
exports.createValue = async (req, res) => {
  try {
    const value = await ValueItem.create(req.body)
    res.status(201).json(value)
  } catch (err) {
    res.status(400).json({ message: 'Failed to create value' })
  }
}

// UPDATE
exports.updateValue = async (req, res) => {
  try {
    const { id } = req.params
    const value = await ValueItem.findByPk(id)
    if (!value) return res.status(404).json({ message: 'Not found' })
    await value.update(req.body)
    res.json(value)
  } catch (err) {
    res.status(400).json({ message: 'Failed to update value' })
  }
}

// DELETE
exports.deleteValue = async (req, res) => {
  try {
    const { id } = req.params
    const value = await ValueItem.findByPk(id)
    if (!value) return res.status(404).json({ message: 'Not found' })
    await value.destroy()
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete value' })
  }
}

const { AboutPreview } = require('../models');

module.exports = {
  // Get all about preview items
  async getAll(req, res) {
    try {
      const data = await AboutPreview.findAll({ order: [['createdAt', 'DESC']] });
      res.json(data);
    } catch (error) {
      console.error('Error fetching about preview:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get single item by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await AboutPreview.findByPk(id);
      if (!data) return res.status(404).json({ error: 'Item not found' });
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Create new about preview item
  async create(req, res) {
    try {
      const { title, description, image } = req.body;
      const newItem = await AboutPreview.create({ title, description, Image });
      res.status(201).json(newItem);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create item' });
    }
  },

  // Updat eitem
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, description, Image } = req.body;

      const item = await AboutPreview.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Item not found' });

      await item.update({ title, description, Image });
      res.json(item);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update item' });
    }
  },

  // Delete item
  async delete(req, res) {
    try {
      const { id } = req.params;
      const item = await AboutPreview.findByPk(id);
      if (!item) return res.status(404).json({ error: 'Item not found' });

      await item.destroy();
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
};
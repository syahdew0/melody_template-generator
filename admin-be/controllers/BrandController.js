const { Brand } = require('../models');

module.exports = {
  // GET /brands → semua brand
  getAll: async (req, res) => {
    try {
      const brands = await Brand.findAll({ order: [['name', 'ASC']] });
      res.json({ success: true, data: brands });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // GET /brands/:id → brand by ID
getById: async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
    res.json({ success: true, data: brand });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
},

  // GET /brands/slug/:slug → brand by slug
  getBySlug: async (req, res) => {
    try {
      const brand = await Brand.findOne({ where: { slug: req.params.slug } });
      if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });
      res.json({ success: true, data: brand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // POST /brands → create brand
  create: async (req, res) => {
    try {
      const brand = await Brand.create(req.body);
      res.status(201).json({ success: true, data: brand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // PUT /brands/:id → update brand
  update: async (req, res) => {
    try {
      const brand = await Brand.findByPk(req.params.id);
      if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

      await brand.update(req.body);
      res.json({ success: true, data: brand });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  },

  // DELETE /brands/:id → delete brand
  delete: async (req, res) => {
    try {
      const brand = await Brand.findByPk(req.params.id);
      if (!brand) return res.status(404).json({ success: false, message: 'Brand not found' });

      await brand.destroy();
      res.json({ success: true, message: 'Brand deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
};

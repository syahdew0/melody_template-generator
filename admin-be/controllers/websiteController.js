// controllers/websiteController.js
const db = require('../models');
const Website = db.Website;
const Theme = db.Theme;

// Get all websites
exports.getAllWebsites = async (req, res) => {
  try {
    const websites = await Website.findAll({
      include: [
        {
          model: Theme,
          as: 'themes'
        }
      ],
      order: [['id', 'DESC']]
    });
    res.json({ success: true, websites });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get one website by ID (with themes)
exports.getWebsiteById = async (req, res) => {
  try {
    const website = await Website.findByPk(req.params.id, {
      include: [{ model: Theme, as: 'themes' }]
    });
    if (!website) return res.status(404).json({ success: false, message: 'Website not found' });

    res.json({ success: true, website });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Create a new website
exports.createWebsite = async (req, res) => {
  try {
    const { name, user_id, subdomain } = req.body;

    const website = await Website.create({
      name,
      user_id,
      subdomain
    });

    res.json({ success: true, website });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a website
exports.updateWebsite = async (req, res) => {
  try {
    const website = await Website.findByPk(req.params.id);
    if (!website) return res.status(404).json({ success: false, message: 'Website not found' });

    const { name, user_id, subdomain } = req.body;

    await website.update({ name, user_id, subdomain });

    res.json({ success: true, website });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete a website
exports.deleteWebsite = async (req, res) => {
  try {
    const website = await Website.findByPk(req.params.id);
    if (!website) return res.status(404).json({ success: false, message: 'Website not found' });

    await website.destroy();
    res.json({ success: true, message: 'Website deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// (Optional) Get active theme for a website 
exports.getActiveTheme = async (req, res) => {
  try {
    const theme = await Theme.findOne({
      where: {
        website_id: req.params.id,
        is_active: true
      }
    });
    if (!theme) return res.status(404).json({ success: false, message: 'No active theme found' });

    res.json({ success: true, theme });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Ambil setting website berdasarkan ID
exports.getSettings = async (req, res) => {
  try {
    const website = await db.Website.findByPk(req.params.id);
    if (!website) return res.status(404).json({ success: false, message: 'Website not found' });

    res.json({ success: true, settings: website });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update setting website berdasarkan ID
exports.updateSettings = async (req, res) => {
  try {
    const website = await db.Website.findByPk(req.params.id);
    if (!website) return res.status(404).json({ success: false, message: 'Website not found' });

    await website.update(req.body);
    res.json({ success: true, website });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

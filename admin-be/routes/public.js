const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Theme, Website } = require('../models');

router.get('/site-info', async (req, res) => {
  try {
    const theme = await Theme.findOne({
      where: { is_active: 1 },
      include: [
        { model: Website, as: 'website', attributes: ['site_title', 'title', 'logo'] }
      ]
    });

    if (!theme) {
      return res.status(404).json({ success: false, message: 'Theme aktif tidak ditemukan' });
    }

    const website = theme.website || {};
    const title = website.site_title || website.title || 'Website';
    const icon = website.logo || '/favicon.ico';
    const apiUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;

    res.json({ 
      id: theme.id,
      name: theme.name || 'Default',
      slug: theme.slug || null,
      title,
      icon,
      apiUrl 
    });
  } catch (err) {
    console.error("Error site-info:", err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/themes/manifest', async (req, res) => {
  try {
    const response = await axios.get('https://themes.phisoft.co.id/manifest.json');
    res.json(response.data); // langsung dikirim ke frontend
  } catch (err) {
    console.error('Gagal ambil manifest:', err.message);
    res.status(500).json({ success: false, message: 'Gagal ambil manifest' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { AboutPreview } = require('../models');

// GET single AboutPreview
router.get('/', async (req, res) => {
  try {
    const data = await AboutPreview.findOne({ where: { id: 1 } });
    if (!data) {
      return res.json({ title: '', description: '', image: '', link: '' });
    }
    res.json(data);
  } catch (err) {
    console.error('GET /api/about-preview error:', err);
    res.status(500).json({ error: 'Gagal memuat data' });
  }
});

// PUT update AboutPreview
router.put('/', async (req, res) => {
    try {
      console.log('BODY:', req.body); // debug
  
      const [record] = await AboutPreview.findOrCreate({ where: { id: 1 } });
      const { title, description, image, link } = req.body;
  
      await record.update({ title, description, image, link });
  
      console.log('UPDATED RECORD:', record.toJSON());
      res.json(record);
    } catch (err) {
      console.error('Error saat update:', err);
      res.status(500).json({ error: 'Gagal menyimpan data' });
    }
  });
  
module.exports = router;

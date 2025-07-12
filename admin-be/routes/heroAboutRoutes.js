const express = require('express');
const router = express.Router();
const controller = require('../controllers/heroAboutController');

// Frontend
router.get('/about-hero', controller.getHeroAbout);

// Admin
router.get('/admin/hero-about', controller.getAll);
router.post('/admin/hero-about', controller.create);
router.put('/admin/hero-about/:id', controller.update);
router.delete('/admin/hero-about/:id', controller.destroy);

module.exports = router;

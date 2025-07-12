const express = require('express');
const router = express.Router();
const contactHeroController = require('../controllers/contactHeroController');

// GET
router.get('/contact-hero', contactHeroController.getHero);

// PUT
router.put('/contact-hero', contactHeroController.updateHero);

module.exports = router;

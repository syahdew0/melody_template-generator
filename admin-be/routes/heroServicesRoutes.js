const express = require('express');
const router = express.Router();
const {
  getHeroServices,
  updateHeroServices,
} = require('../controllers/heroServicesController');

// Endpoint: GET /api/hero-services
router.get('/', getHeroServices);

// Endpoint: PUT /api/hero-services
router.put('/', updateHeroServices);

module.exports = router;

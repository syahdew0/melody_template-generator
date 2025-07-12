const express = require('express');
const router = express.Router();
const mapsSectionController = require('../controllers/mapsSectionController');

router.get('/maps-section', mapsSectionController.getMapsSection);
router.put('/maps-section', mapsSectionController.updateMapsSection);

module.exports = router;

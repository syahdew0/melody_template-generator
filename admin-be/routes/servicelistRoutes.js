const express = require('express');
const router = express.Router();
const controller = require('../controllers/servicesectionController');

router.get('/', controller.getServiceSection);
router.put('/', controller.updateServiceSection);

module.exports = router;

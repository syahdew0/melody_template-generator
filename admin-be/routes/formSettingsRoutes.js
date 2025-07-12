const express = require('express');
const router = express.Router();
const controller = require('../controllers/formSettingsController');

// GET data form
router.get('/', controller.getSettings);

// PUT update data form
router.put('/', controller.updateSettings);

module.exports = router;

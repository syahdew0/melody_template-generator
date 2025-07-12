const express = require('express');
const router = express.Router();
const controller = require('../controllers/portfolioPreviewController');

// Ubah route ke root, bukan '/preview'
router.get('/', controller.getPreview);
router.put('/', controller.updatePreview);

module.exports = router;

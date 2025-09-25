const express = require('express');
const router = express.Router();
const { sendContactEmail } = require('../controllers/contactController');

// Endpoint untuk frontend
router.post('/frontend/contact-send-email', sendContactEmail);

module.exports = router;

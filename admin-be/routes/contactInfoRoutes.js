const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactInfoController');

router.get('/contact-info', controller.getContactInfo);
router.put('/admin/contact-info', controller.updateContactInfo);

module.exports = router;

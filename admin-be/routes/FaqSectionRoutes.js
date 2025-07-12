const express = require('express');
const router = express.Router();
const faqSectionController = require('../controllers/faqSectionController');

router.get('/', faqSectionController.getFaqSection);
router.put('/', faqSectionController.updateFaqSection);

module.exports = router;

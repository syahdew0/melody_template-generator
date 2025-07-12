const express = require('express');
const router = express.Router();
const controller = require('../controllers/layoutController');

router.get('/:siteId', controller.getLayoutBySite);
router.put('/:siteId', controller.updateLayout);

module.exports = router;

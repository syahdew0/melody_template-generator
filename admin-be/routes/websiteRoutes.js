// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');


router.get('/', websiteController.getAllWebsites);
router.get('/:id', websiteController.getWebsiteById);
router.post('/', websiteController.createWebsite);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);

// Optional shortcut
router.get('/:id/active-theme', websiteController.getActiveTheme);

router.get('/:id/settings', websiteController.getSettings);
router.put('/:id/settings', websiteController.updateSettings);


module.exports = router;

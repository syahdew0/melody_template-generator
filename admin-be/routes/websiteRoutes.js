// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');


router.get('/', websiteController.getAllWebsites);
router.get('/:id', websiteController.getWebsiteById);
router.post('/', websiteController.createWebsite);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);

// Optional shortcut
router.get('/:id/active-theme', websiteController.getActiveTheme);

router.get('/:id/settings', requireAuth, requireModulePermission('Setting', 'canView'), websiteController.getSettings);
router.put('/:id/settings', requireAuth, requireModulePermission('Setting', 'canEdit'), websiteController.updateSettings);


module.exports = router;

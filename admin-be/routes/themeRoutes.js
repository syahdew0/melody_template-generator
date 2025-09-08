const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// ====================== PUBLIC ROUTES ====================== //
router.get('/', requireAuth, requireModulePermission('Theme', 'canView'), themeController.getThemesByWebsite);
router.get('/:website_id/active-theme', requireAuth, requireModulePermission('Theme', 'canView'), themeController.getActiveTheme);

// ====================== ADMIN / EDIT ROUTES ====================== //
router.post('/', requireAuth, requireModulePermission('Theme', 'canAdd'), themeController.createTheme);
router.put('/:id', requireAuth, requireModulePermission('Theme', 'canEdit'), themeController.updateTheme);
router.delete('/:id', requireAuth, requireModulePermission('Theme', 'canDelete'), themeController.deleteTheme);

// Set active theme (biasanya edit)
router.put('/:id/active', requireAuth, requireModulePermission('Theme', 'canEdit'), themeController.setActiveTheme);

module.exports = router;

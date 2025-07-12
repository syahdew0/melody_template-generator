const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');


router.get('/', themeController.getThemesByWebsite);
router.get('/:website_id/active-theme', themeController.getActiveTheme);
router.post('/', themeController.createTheme);
router.put('/:id', themeController.updateTheme);
router.delete('/:id', themeController.deleteTheme);

router.put('/:id/active', themeController.setActiveTheme);

module.exports = router;

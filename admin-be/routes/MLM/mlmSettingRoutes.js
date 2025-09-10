const express = require('express');
const router = express.Router();
const mlmSettingController = require('../../controllers/MLM/mlmSettingController');
const { requireAuth } = require('../../middlewares/authMiddleware');

// GET /api/admin/mlm-settings
router.get('/', requireAuth, mlmSettingController.getSettings);

// PUT /api/admin/mlm-settings
router.put('/', requireAuth, mlmSettingController.updateSettings);

module.exports = router;

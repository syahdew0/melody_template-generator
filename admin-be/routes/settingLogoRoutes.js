const express = require('express')
const router = express.Router()
const controller = require('../controllers/settingLogoController')
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');
// Ambil logo
router.get('/', controller.getLogo)

// Simpan atau update logo
router.post('/', requireAuth, requireModulePermission("Setting Logo", "canUpdate"), controller.saveLogo)

module.exports = router

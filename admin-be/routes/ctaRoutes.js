const express = require('express')
const router = express.Router()
const ctaController = require('../controllers/ctaController')

router.get('/cta', ctaController.getCta)
router.put('/admin/cta', ctaController.updateCta)

module.exports = router
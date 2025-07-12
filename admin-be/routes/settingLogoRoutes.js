const express = require('express')
const router = express.Router()
const controller = require('../controllers/settingLogoController')

// Ambil logo
router.get('/', controller.getLogo)

// Simpan atau update logo
router.post('/', controller.saveLogo)

module.exports = router

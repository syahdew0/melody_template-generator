const express = require('express')
const router = express.Router()
const footerController = require('../controllers/footerController')

// Route untuk frontend publik
router.get('/footer', footerController.getFooterPublic)

// Route admin panel
router.get('/admin/footer', footerController.getFooterAdmin)
router.put('/admin/footer', footerController.updateFooter)

module.exports = router

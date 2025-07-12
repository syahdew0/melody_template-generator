const express = require('express')
const router = express.Router()
const controller = require('../controllers/processSectionController')

router.get('/', controller.getProcessSection)
router.put('/admin/process-section', controller.updateProcessSection)

module.exports = router

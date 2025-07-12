const express = require('express')
const router = express.Router()
const controller = require('../controllers/statsController')

router.get('/stats', controller.getData)
router.post('/stats', controller.saveData)

module.exports = router

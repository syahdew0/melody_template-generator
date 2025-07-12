// routes/valueSectionRoutes.js
const express = require('express')
const router = express.Router()
const controller = require('../controllers/valueSectionController')

router.get('/', controller.getValues)
router.post('/', controller.createValue)
router.put('/:id', controller.updateValue)
router.delete('/:id', controller.deleteValue)

module.exports = router

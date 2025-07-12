const express = require('express')
const router = express.Router()
const heroHomeController = require('../controllers/heroHomeController')

router.get('/', heroHomeController.getHeroHome)
router.put('/', heroHomeController.updateHeroHome)


module.exports = router

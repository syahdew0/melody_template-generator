const express = require('express');
const router = express.Router();
const masterbankController = require('../controllers/masterbankController');

router.get('/', masterbankController.getPublicBanks);
router.post('/', masterbankController.createBank);
router.put('/:id', masterbankController.updateBank);
router.delete('/:id', masterbankController.deleteBank);


module.exports = router;

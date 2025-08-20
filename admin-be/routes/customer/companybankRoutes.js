const express = require('express');
const router = express.Router();
const companybankController = require('../../controllers/companybankController');
const authenticateCustomer = require('../../middlewares/authCustomer');

// Hanya bank aktif untuk customer
router.get('/active', authenticateCustomer, companybankController.getActiveBanksForCustomer);

module.exports = router;

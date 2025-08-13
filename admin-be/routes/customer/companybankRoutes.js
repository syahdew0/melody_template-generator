// routes/customer/companyBank.js
const express = require('express');
const router = express.Router();
const companybankController = require('../../controllers/customer/companybankController');
const authenticateCustomer = require('../../middlewares/authCustomer');

router.get('/', authenticateCustomer, companybankController.getAll);

module.exports = router;

const express = require('express');
const router = express.Router();
const companyBankController = require('../controllers/companybankController');

// router.get('/company-banks', companyBankController.getCompanyBanks);
router.get('/', companyBankController.getAll);

module.exports = router;

const express = require('express');
const router = express.Router();
const companyBankController = require('../controllers/companybankController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// router.get('/company-banks', companyBankController.getCompanyBanks);

router.get('/',requireAuth, requireAdmin, companyBankController.getAll);

module.exports = router;

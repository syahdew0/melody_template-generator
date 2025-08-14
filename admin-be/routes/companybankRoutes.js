const express = require('express');
const router = express.Router();
const companyBankController = require('../controllers/companybankController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// router.get('/company-banks', companyBankController.getCompanyBanks);

router.get('/',requireAuth, requireAdmin, companyBankController.getAll);

// routes/companyBanks.js
router.post('/', requireAuth, requireAdmin, companyBankController.create);

module.exports = router;

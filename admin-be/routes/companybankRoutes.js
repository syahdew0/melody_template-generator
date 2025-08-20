const express = require('express');
const router = express.Router();
const companyBankController = require('../controllers/companybankController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// router.get('/company-banks', companyBankController.getCompanyBanks);
// Admin routes
router.get('/', requireAuth, requireAdmin, companyBankController.getAll);
router.post('/', requireAuth, requireAdmin, companyBankController.create);
router.put('/:id', requireAuth, requireAdmin, companyBankController.update);
router.delete('/:id', requireAuth, requireAdmin, companyBankController.remove);
router.patch('/:id/deactivate', requireAuth, requireAdmin, companyBankController.deactivate);
router.patch('/:id/activate', requireAuth, requireAdmin, companyBankController.activate);



module.exports = router;

const express = require('express');
const router = express.Router();

const topupController = require('../controllers/transaksi/topupController');
const adjustController = require('../controllers/transaksi/adjustController');
const withdrawController = require('../controllers/transaksi/withdrawController');
const walletController = require('../controllers/transaksi/walletController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Admin - Topup
router.get('/topup', requireAuth, requireAdmin, topupController.list);
router.put('/topup/:id/status', requireAuth, requireAdmin, topupController.updateStatus);
router.get('/topup-summary', requireAuth, requireAdmin, topupController.getTopupSummary);
router.put('/topup/bulk-update-status', requireAuth, requireAdmin, topupController.bulkUpdateStatus);

// Admin - Adjust
router.post('/adjust', requireAuth, requireAdmin, adjustController.create);
router.get('/adjust', requireAuth, requireAdmin, adjustController.list);
router.get('/adjust-summary', requireAuth, requireAdmin, adjustController.getAdjustSummary);

// Admin - Withdraw
router.get('/withdraw', requireAuth, requireAdmin, withdrawController.list);
router.put('/withdraw/:id/status', requireAuth, requireAdmin, withdrawController.updateStatus);
router.put('/withdraw/bulk-update-status', requireAuth, requireAdmin, withdrawController.bulkUpdateStatus);

// Admin Wallet
router.get('/wallet-histories', requireAuth, requireAdmin, walletController.getAdminWalletHistory);
router.get('/wallet-histories/usernames', requireAuth, requireAdmin, walletController.getWalletUsernames);


module.exports = router;

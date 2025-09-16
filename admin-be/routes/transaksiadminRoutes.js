// const express = require('express');
// const router = express.Router();

// const topupController = require('../controllers/transaksi/topupController');
// const adjustController = require('../controllers/transaksi/adjustController');
// const withdrawController = require('../controllers/transaksi/withdrawController');
// const walletController = require('../controllers/transaksi/walletController');

// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// // Admin - Topup
// router.get('/topup', requireAuth, requireAdmin, topupController.list);
// router.put('/topup/:id/status', requireAuth, requireAdmin, topupController.updateStatus);
// router.get('/topup-summary', requireAuth, requireAdmin, topupController.getTopupSummary);
// router.put('/topup/bulk-update-status', requireAuth, requireAdmin, topupController.bulkUpdateStatus);

// // Admin - Adjust
// router.post('/adjust', requireAuth, requireAdmin, adjustController.create);
// router.get('/adjust', requireAuth, requireAdmin, adjustController.list);
// router.get('/adjust-summary', requireAuth, requireAdmin, adjustController.getAdjustSummary);

// // Admin - Withdraw
// router.get('/withdraw', requireAuth, requireAdmin, withdrawController.list);
// router.put('/withdraw/:id/status', requireAuth, requireAdmin, withdrawController.updateStatus);
// router.put('/withdraw/bulk-update-status', requireAuth, requireAdmin, withdrawController.bulkUpdateStatus);

// // Admin Wallet
// router.get('/wallet-histories', requireAuth, requireAdmin, walletController.getAdminWalletHistory);
// router.get('/wallet-histories/usernames', requireAuth, requireAdmin, walletController.getWalletUsernames);

// module.exports = router;

const express = require('express');
const router = express.Router();

const topupController = require('../controllers/transaksi/topupController');
const adjustController = require('../controllers/transaksi/adjustController');
const withdrawController = require('../controllers/transaksi/withdrawController');
const walletController = require('../controllers/transaksi/walletController');

const { requireAuth, requireOtherModule, requireModulePermission } = require('../middlewares/authMiddleware');

// ======================================================
// Admin - Topups
router.get('/topup', requireAuth, requireModulePermission('Topups', 'canView'), topupController.list);
router.get('/topup-summary', requireAuth, requireModulePermission('Topups', 'canView'), topupController.getTopupSummary);
router.put('/topup/:id/status', requireAuth, requireOtherModule('Boleh Approve Topups'), topupController.updateStatus);
router.put('/topup/bulk-update-status', requireAuth, requireOtherModule('Boleh Approve Topups'), topupController.bulkUpdateStatus);


// ======================================================
// Admin - Withdraw
router.get('/withdraw', requireAuth, requireModulePermission('Withdraw', 'canView'), withdrawController.list);
router.put('/withdraw/:id/status', requireAuth, requireOtherModule('Boleh Approve Withdraw'), withdrawController.updateStatus);
router.put('/withdraw/bulk-update-status', requireAuth, requireOtherModule('Boleh Approve Withdraw'), withdrawController.bulkUpdateStatus);

// ======================================================
// Admin - Adjust
router.get('/adjust', requireAuth, requireModulePermission('Adjust', 'canView'), adjustController.list);
router.get('/adjust-summary', requireAuth, requireModulePermission('Adjust', 'canView'), adjustController.getAdjustSummary);
router.post('/adjust', requireAuth, requireOtherModule('Adjust'), adjustController.create);

// ======================================================
// Admin Wallet
router.get('/wallet-histories', requireAuth, requireModulePermission('Wallet', 'canView'), walletController.getAdminWalletHistory);
router.get('/wallet-histories/usernames', requireAuth, requireModulePermission('Wallet', 'canView'), walletController.getWalletUsernames);

// Admin - MLM Transactions
router.get(
  '/mlm-transactions', requireAuth,requireModulePermission('Wallet', 'canView'),walletController.getAdminMlmTransactions);

module.exports = router;

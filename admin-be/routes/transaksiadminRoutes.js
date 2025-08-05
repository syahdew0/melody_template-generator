const express = require('express');
const router = express.Router();

const topupController = require('../controllers/transaksi/topupController');
const adjustController = require('../controllers/transaksi/adjustController');
const withdrawController = require('../controllers/transaksi/withdrawController');

const { requireAuth } = require('../middlewares/authMiddleware'); // middleware admin

// Admin - Topup
router.get('/topup', requireAuth, topupController.list);
router.put('/topup/:id/status', requireAuth, topupController.updateStatus);
router.get('/topup', requireAuth, topupController.getTopupList);
router.get('/topup-summary', requireAuth, topupController.getTopupSummary);

// Admin - Adjust
router.post('/adjust', requireAuth, adjustController.create);
router.get('/adjust', requireAuth, adjustController.list);

// Admin - Withdraw
router.get('/withdraw', requireAuth, withdrawController.list);
router.put('/withdraw/:id/status', requireAuth, withdrawController.updateStatus);

module.exports = router;

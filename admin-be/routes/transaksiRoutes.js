const express = require('express');
const router = express.Router();

const topupController = require('../controllers/transaksi/topupController');
const adjustController = require('../controllers/transaksi/adjustController');
const withdrawController = require('../controllers/transaksi/withdrawController');
const walletController = require('../controllers/transaksi/walletController');

const authenticateCustomer = require('../middlewares/authCustomer'); // untuk customer
const { requireAuth } = require('../middlewares/authMiddleware');   // untuk admin

// Customer

// Ambil saldo wallet customer yang sedang login
router.get('/me', authenticateCustomer, walletController.getMyWallet);

// Customer membuat request topup
router.post('/topup', authenticateCustomer, topupController.create);

// Customer mengajukan withdraw
router.post('/withdraw', authenticateCustomer, withdrawController.create);


// admin
// Admin melihat dan update topup
router.get('/topup', requireAuth, topupController.list);
router.put('/topup/:id/status', requireAuth, topupController.updateStatus);

// Adjust Routes (admin only)
router.post('/adjust', requireAuth, adjustController.create);
router.get('/adjust', requireAuth, adjustController.list);

// Admin melihat & memproses withdraw
router.get('/withdraw', requireAuth, withdrawController.list);
router.put('/withdraw/:id/status', requireAuth, withdrawController.updateStatus);

module.exports = router;

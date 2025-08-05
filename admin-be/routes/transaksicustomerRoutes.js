const express = require('express');
const router = express.Router();

const topupController = require('../controllers/transaksi/topupController');
const withdrawController = require('../controllers/transaksi/withdrawController');
const walletController = require('../controllers/transaksi/walletController');

const authenticateCustomer = require('../middlewares/authCustomer'); // middleware customer

// Customer - Wallet
router.get('/me', authenticateCustomer, walletController.getMyWallet);
// router.get('/me/total-balance', authenticateCustomer, walletController.getMyTotalBalance);
router.get('/me/total-balance', authenticateCustomer, walletController.getMyTotalBalance);



// Customer - Topup
router.post('/topup', authenticateCustomer, topupController.create);
router.get('/topups', authenticateCustomer, topupController.getTopupList);

// Customer - Withdraw
router.post('/withdraw', authenticateCustomer, withdrawController.create);
router.get('/withdraw', authenticateCustomer, withdrawController.listCustomer);

module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../../controllers/settingTransaksiController');
const authenticateCustomer = require('../../middlewares/authCustomer');

// GET semua setting transaksi khusus customer
router.get('/', authenticateCustomer, controller.getTransaksiSettings);


module.exports = router;

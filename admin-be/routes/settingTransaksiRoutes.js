const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingTransaksiController');
const { requireAuth } = require('../middlewares/authMiddleware');

// GET semua setting transaksi
router.get('/', controller.getTransaksiSettings);

// POST update per key
router.post('/', controller.updateTransaksiSetting);



module.exports = router;

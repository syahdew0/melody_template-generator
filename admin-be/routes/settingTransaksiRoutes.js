// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/settingTransaksiController');
// const { requireAuth } = require('../middlewares/authMiddleware');

// // GET semua setting transaksi
// router.get('/', controller.getTransaksiSettings);

// // POST update per key
// router.post('/', controller.updateTransaksiSetting);



// module.exports = router;

const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingTransaksiController');
const { requireAuth, requireOtherModule } = require('../middlewares/authMiddleware');

// ====================== TRANSAKSI SETTINGS ====================== //

// GET semua setting transaksi (view)
router.get(
  '/',
  requireAuth,
  requireOtherModule("Adjust"), // hanya role yang punya module 'Adjust'
  controller.getTransaksiSettings
);

// POST update per key (edit)
router.post(
  '/',
  requireAuth,
  requireOtherModule("Adjust"), // hanya role yang punya module 'Adjust'
  controller.updateTransaksiSetting
);

module.exports = router;

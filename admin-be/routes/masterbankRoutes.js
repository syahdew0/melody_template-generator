const express = require('express');
const router = express.Router();
const masterbankController = require('../controllers/masterbankController');

router.get('/', masterbankController.getPublicBanks);
router.post('/', masterbankController.createBank);
router.put('/:id', masterbankController.updateBank);
router.delete('/:id', masterbankController.deleteBank);


module.exports = router;

// const express = require('express');
// const router = express.Router();
// const masterbankController = require('../controllers/masterbankController');
// const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// // ====================== PUBLIC ====================== //
// // Ambil daftar bank publik (tidak perlu login)
// router.get('/', masterbankController.getPublicBanks);

// // ====================== ADMIN ====================== //
// // Tambah bank
// router.post(
//   '/',
//   requireAuth,
//   requireModulePermission("Bank Customer", "canAdd"),
//   masterbankController.createBank
// );

// // Update bank
// router.put(
//   '/:id',
//   requireAuth,
//   requireModulePermission("Bank Customer", "canEdit"),
//   masterbankController.updateBank
// );

// // Hapus bank
// router.delete(
//   '/:id',
//   requireAuth,
//   requireModulePermission("Bank Customer", "canDelete"),
//   masterbankController.deleteBank
// );

// module.exports = router;

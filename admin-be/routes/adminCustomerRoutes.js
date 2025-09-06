const express = require('express');
const router = express.Router();
const adminCustomerController = require('../controllers/adminCustomerController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/customers', requireAuth, requireAdmin, adminCustomerController.getAllCustomers);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const adminCustomerController = require('../controllers/adminCustomerController');
// const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// // List semua customer
// router.get(
//   '/customers',
//   requireAuth,
//   requireModulePermission("Daftar Customer", "canView"), // sesuaikan nama module di DB
//   adminCustomerController.getAllCustomers
// );

// module.exports = router;

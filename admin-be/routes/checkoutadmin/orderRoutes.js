const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/checkoutadmin/orderController');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.get('/', requireAuth, adminOrderController.listOrders);          
router.get('/:id', requireAuth, adminOrderController.orderDetail);      
router.put('/:id/status', requireAuth, adminOrderController.updateStatus);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const adminOrderController = require('../../controllers/checkoutadmin/orderController');
// const { requireAuth, requireModulePermission } = require('../../middlewares/authMiddleware');

// // List semua order (view)
// router.get(
//   '/',
//   requireAuth,
//   requireModulePermission("Order", "canView"), // ganti "Order" sesuai nama module di DB
//   adminOrderController.listOrders
// );

// // Ambil detail order (view)
// router.get(
//   '/:id',
//   requireAuth,
//   requireModulePermission("Order", "canView"),
//   adminOrderController.orderDetail
// );

// // Update status order (edit)
// router.put(
//   '/:id/status',
//   requireAuth,
//   requireModulePermission("Order", "canEdit"),
//   adminOrderController.updateStatus
// );

// module.exports = router;

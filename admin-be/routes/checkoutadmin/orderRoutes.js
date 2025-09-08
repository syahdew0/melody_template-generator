// const express = require('express');
// const router = express.Router();
// const adminOrderController = require('../../controllers/checkoutadmin/orderController');
// const { requireAuth } = require('../../middlewares/authMiddleware');

// router.get('/', requireAuth, adminOrderController.listOrders);          
// router.get('/:id', requireAuth, adminOrderController.orderDetail);      
// router.put('/:id/status', requireAuth, adminOrderController.updateStatus);

// module.exports = router;

const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/checkoutadmin/orderController');
const { requireAuth, requireModulePermission, requireOtherModule } = require('../../middlewares/authMiddleware');

// List semua order (view)
router.get(
  '/',
  requireAuth,
  requireModulePermission("Order", "canView"), 
  adminOrderController.listOrders
);

// Ambil detail order (view)
router.get(
  '/:id',
  requireAuth,
  requireModulePermission("Order", "canView"),
  adminOrderController.orderDetail
);

// Update status order (edit)
router.put(
  '/:id/status',
  requireAuth,
  requireOtherModule("Boleh Update Order"),
  adminOrderController.updateStatus
);
module.exports = router;

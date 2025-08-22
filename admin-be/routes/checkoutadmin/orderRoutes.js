const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/checkoutadmin/orderController');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.get('/', requireAuth, adminOrderController.listOrders);          
router.get('/:id', requireAuth, adminOrderController.orderDetail);      
router.put('/:id/status', requireAuth, adminOrderController.updateStatus);

module.exports = router;

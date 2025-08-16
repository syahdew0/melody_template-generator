const express = require('express');
const router = express.Router();
const adminOrderController = require('../../controllers/admin/orderController');
const { requireAuth, requireAdmin } = require('../../middlewares/authMiddleware');

// Admin management order
router.get('/orders', requireAuth, requireAdmin, adminOrderController.getAll);
router.get('/orders/:id', requireAuth, requireAdmin, adminOrderController.getById);
router.post('/orders/:order_id/status', requireAuth, requireAdmin, adminOrderController.updateStatus);

module.exports = router;

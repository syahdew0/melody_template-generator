const express = require('express');
const router = express.Router();
const adminCustomerController = require('../controllers/adminCustomerController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/customers', requireAuth, requireAdmin, adminCustomerController.getAllCustomers);

module.exports = router;

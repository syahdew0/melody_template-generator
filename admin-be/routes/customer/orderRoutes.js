const express = require('express');
const router = express.Router();
const customerOrderController = require('../../controllers/customer/orderController');
const authenticateCustomer = require('../../middlewares/authCustomer');

router.post('/checkout', authenticateCustomer, customerOrderController.checkout);
router.post('/checkout/pay', authenticateCustomer, customerOrderController.pay);
router.get('/my-orders', authenticateCustomer, customerOrderController.myOrders);
router.post('/checkout/pay', authenticateCustomer, customerOrderController.checkoutWithSaldo);


module.exports = router;

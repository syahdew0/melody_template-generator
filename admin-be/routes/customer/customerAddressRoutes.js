const express = require('express');
const router = express.Router();
const customerAddressController = require('../../controllers/customer/customerAddressController');
const authenticateCustomer = require('../../middlewares/authCustomer');

router.get('/', authenticateCustomer, customerAddressController.list);
router.post('/', authenticateCustomer, customerAddressController.create);
router.put('/:id', authenticateCustomer, customerAddressController.update);
router.delete('/:id', authenticateCustomer, customerAddressController.delete);

module.exports = router;

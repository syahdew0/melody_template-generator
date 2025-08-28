const express = require('express');
const router = express.Router();
const customerAddressController = require('../../controllers/customer/customerAddressController');
const authenticateCustomer = require('../../middlewares/authCustomer');

router.get('/', authenticateCustomer, customerAddressController.list);
router.post('/', authenticateCustomer, customerAddressController.create);
router.put('/:id', authenticateCustomer, customerAddressController.update);
router.delete('/:id', authenticateCustomer, customerAddressController.delete);

router.get('/provinces', authenticateCustomer, customerAddressController.provinces);
router.get('/regencies', authenticateCustomer, customerAddressController.regencies);
router.get('/districts', authenticateCustomer, customerAddressController.districts);
router.get('/villages', authenticateCustomer, customerAddressController.villages)

module.exports = router;

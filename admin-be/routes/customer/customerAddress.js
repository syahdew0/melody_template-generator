const express = require('express');
const router = express.Router();
const controller = require('../../controllers/customerAddressController');
const authenticateCustomer = require('../../middlewares/authCustomer');

router.get('/', authenticateCustomer, controller.list);
router.post('/', authenticateCustomer, controller.create);
router.put('/:id', authenticateCustomer, controller.update);
router.delete('/:id', authenticateCustomer, controller.delete);

module.exports = router;

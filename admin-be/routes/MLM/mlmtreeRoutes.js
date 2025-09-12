const express = require('express');
const router = express.Router();
const { getTree } = require('../../controllers/MLM/mlmtreeController');
const authenticateCustomer = require('../../middlewares/authCustomer');

// Endpoint untuk mengambil MLM tree user
router.get('/tree', authenticateCustomer, getTree);

module.exports = router;

const express = require('express');
const router = express.Router();
const mlmRegisterController = require('../../controllers/MLM/mlmRegisterController');
const mlmDownlineController = require('../../controllers/MLM/mlmDownlineController');
const authenticateCustomer = require('../../middlewares/authCustomer');

// Gabung MLM sendiri
router.post('/join', authenticateCustomer, mlmRegisterController.joinMLM);

// Tambah downline
router.post('/add-downline', authenticateCustomer, mlmDownlineController.addDownline);

module.exports = router;

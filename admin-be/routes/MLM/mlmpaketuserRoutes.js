// routes/MLM/mlmpaketuserRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/MLM/mlmpaketuserController');

// GET /api/admin/paket-user
router.get('/', controller.getJoinMLMTransactions);

module.exports = router;

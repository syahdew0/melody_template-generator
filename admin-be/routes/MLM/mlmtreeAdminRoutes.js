const express = require('express');
const router = express.Router();
const { getAdminTree } = require('../../controllers/MLM/mlmtreeAdminController');
const { requireAuth } = require('../../middlewares/authMiddleware');

// khusus admin
router.get('/tree', requireAuth, getAdminTree);

module.exports = router;

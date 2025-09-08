const express = require('express');
const router = express.Router();
const permissionController = require('../../controllers/role/permissionController');
const { requireAuth, } = require('../../middlewares/authMiddleware');

router.get('/', requireAuth, permissionController.getUserPermissions);

module.exports = router;

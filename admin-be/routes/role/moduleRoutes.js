const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../../middlewares/authMiddleware');
const moduleController = require('../../controllers/role/moduleController');

// Ambil semua modul
router.get('/', requireAuth, moduleController.getModules);

// CRUD Modul (hanya admin)
router.post('/', requireAuth, requireAdmin, moduleController.createModule);
router.put('/:id', requireAuth, requireAdmin, moduleController.updateModule);
router.delete('/:id', requireAuth, requireAdmin, moduleController.deleteModule);

module.exports = router;

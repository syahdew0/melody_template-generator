// routes/MLM/mlmPengaduanAdminRoutes.js
const express = require('express');
const router = express.Router();
const mlmPengaduanController = require('../../controllers/MLM/mlmPengaduanAdminController');
const { requireAuth } = require('../../middlewares/authMiddleware');

// Admin lihat semua pengaduan
router.get('/', requireAuth, mlmPengaduanController.getAll);
// get by id
router.get('/:id', requireAuth, mlmPengaduanController.getById);
// Admin update status/prioritas pengaduan
router.put('/:id', requireAuth, mlmPengaduanController.updatePengaduan);

module.exports = router;

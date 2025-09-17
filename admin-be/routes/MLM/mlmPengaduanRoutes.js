const express = require('express');
const router = express.Router();
const mlmPengaduanController = require('../../controllers/MLM/mlmPengaduanController');
const authenticateCustomer = require('../../middlewares/authCustomer');
// const { requireAuth } = require('../../middlewares/authMiddleware');

// Customer kirim pengaduan
router.post('/mlm-complaints', authenticateCustomer, mlmPengaduanController.createPengaduan);

// Admin lihat semua pengaduan
// router.get('/mlm-complaints', requireAuth, mlmPengaduanController.getAll);

// Admin update status/prioritas pengaduan
// router.put('/mlm-complaints/:id', requireAuth, mlmPengaduanController.updatePengaduan);

module.exports = router;

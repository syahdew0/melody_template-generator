// routes/authRoutes.js
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
// const kontenController = require('../controllers/kontenController')
// const transaksiController = require('../controllers/transaksiController')
// const laporanController = require('../controllers/laporanController')
const { requireAuth } = require('../middlewares/authMiddleware')

router.get('/me', requireAuth, authController.getMe)
router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/forgot-password', authController.forgotPassword)
router.post('/reset-password/:token', authController.resetPassword)

// Konten routes
// router.post('/konten', requireAuth, requirePermission('manage_content'), kontenController.create)
// router.get('/konten', requireAuth, requirePermission('view_content'), kontenController.list)
// router.put('/konten/:id', requireAuth, requirePermission('manage_content'), kontenController.update)
// router.delete('/konten/:id', requireAuth, requirePermission('manage_content'), kontenController.delete)

// Transaksi routes
// router.post('/transaksi', requireAuth, requirePermission('manage_transaction'), transaksiController.create)
// router.get('/transaksi', requireAuth, requirePermission('view_transaction'), transaksiController.list)
// router.put('/transaksi/:id', requireAuth, requirePermission('manage_transaction'), transaksiController.update)
// router.delete('/transaksi/:id', requireAuth, requirePermission('manage_transaction'), transaksiController.delete)

// Laporan routes
// router.get('/laporan', requireAuth, requirePermission('view_only'), laporanController.list)



module.exports = router

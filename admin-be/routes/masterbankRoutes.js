const express = require('express');
const router = express.Router();
const masterbankController = require('../controllers/masterbankController');

// Endpoint publik untuk ambil daftar bank aktif
// GET /api/public/banks
// router.get('/public/banks', masterbankController.getPublicBanks);
router.get('/', masterbankController.getPublicBanks);


module.exports = router;

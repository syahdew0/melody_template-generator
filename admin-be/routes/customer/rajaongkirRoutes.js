const express = require('express');
const router = express.Router();
const rajaongkirController = require('../../controllers/customer/rajaongkirController');

// Ambil daftar provinsi
router.get('/provinces', rajaongkirController.getProvinces);

// Ambil daftar kota berdasarkan province_id
router.get('/cities/:province_id', rajaongkirController.getCities);

// Hitung ongkir
router.post('/cost', rajaongkirController.getCost);

module.exports = router;

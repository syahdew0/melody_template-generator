const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');


router.get('/', addressController.list);
router.post('/', addressController.create);
router.put('/:id', addressController.update);
router.delete('/:id',  addressController.delete);

router.get('/provinces', addressController.provinces);
router.get('/regencies', addressController.regencies);
router.get('/districts',  addressController.districts);
router.get('/villages',  addressController.villages)

module.exports = router;

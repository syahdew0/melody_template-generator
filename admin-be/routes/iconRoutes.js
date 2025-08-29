const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const iconController = require('../controllers/iconController');

router.get('/favicon', iconController.getFavicon);        // GET favicon
router.post('/upload', upload.single('file'), iconController.uploadFavicon); // POST upload
router.post('/save', iconController.setFavicon);         // POST save

module.exports = router;

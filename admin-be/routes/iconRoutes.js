const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const iconController = require('../controllers/iconController');


router.get('/favicon', iconController.getFavicon);

router.post('/upload', upload.single('file'), iconController.uploadFavicon);

router.post('/save', iconController.setFavicon);

module.exports = router;

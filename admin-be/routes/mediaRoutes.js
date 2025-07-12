const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const mediaController = require('../controllers/mediaController');

router.get('/media', mediaController.getAllMedia);
router.post('/media', upload.single('file'), mediaController.uploadMedia);
router.delete('/media/:id', mediaController.deleteMedia);

module.exports = router;

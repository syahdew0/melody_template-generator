// const express = require('express');
// const router = express.Router();
// const upload = require('../middlewares/upload');
// const iconController = require('../controllers/iconController');

// router.get('/favicon', iconController.getFavicon);        // GET favicon
// router.post('/upload', upload.single('file'), iconController.uploadFavicon); // POST upload
// router.post('/save', iconController.setFavicon);         // POST save

// module.exports = router;

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const iconController = require('../controllers/iconController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// ====================== PUBLIC / FRONTEND ====================== //
// Ambil favicon (tidak perlu auth)
router.get('/favicon', iconController.getFavicon);

// ====================== ADMIN ====================== //
// Upload favicon
router.post(
  '/upload',
  requireAuth,
  requireModulePermission("Icon Setting", "canAdd"),
  upload.single('file'),
  iconController.uploadFavicon
);

// Set / save favicon
router.post(
  '/save',
  requireAuth,
  requireModulePermission("Icon Setting", "canEdit"),
  iconController.setFavicon
);

module.exports = router;

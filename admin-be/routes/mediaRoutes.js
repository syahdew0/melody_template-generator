// const express = require('express');
// const router = express.Router();
// const upload = require('../middlewares/upload');
// const mediaController = require('../controllers/mediaController');

// router.get('/media', mediaController.getAllMedia);
// router.post('/media', upload.single('file'), mediaController.uploadMedia);
// router.delete('/media/:id', mediaController.deleteMedia);

// module.exports = router;

const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const mediaController = require('../controllers/mediaController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// Middleware dinamis: cek permission "Media"
const checkMediaPermission = (action) => {
  return requireModulePermission("media", action);
};

// GET all media
router.get(
  '/media',
  requireAuth,
  checkMediaPermission("canView"),
  mediaController.getAllMedia
);

// UPLOAD media
router.post(
  '/media',
  requireAuth,
  checkMediaPermission("canAdd"),
  upload.single('file'),
  mediaController.uploadMedia
);

// DELETE media
router.delete(
  '/media/:id',
  requireAuth,
  checkMediaPermission("canDelete"),
  mediaController.deleteMedia
);

module.exports = router;

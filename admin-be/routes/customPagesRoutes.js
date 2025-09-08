// const express = require('express');
// const router = express.Router();
// const customPageController = require('../controllers/customPageController');

// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
// router.delete('/deleteByTag/:tag', requireAuth, requireAdmin, customPageController.deleteByTag)

// router.get('/frontend', customPageController.getByPage);
// router.get('/',requireAuth, requireAdmin, customPageController.getAll);
// router.post('/',requireAuth, requireAdmin, customPageController.create);
// router.get('/:id', requireAuth, requireAdmin,customPageController.getById);
// router.put('/:id',requireAuth, requireAdmin, customPageController.update);
// router.delete('/:id',requireAuth, requireAdmin, customPageController.remove);

// module.exports = router;

const express = require('express');
const router = express.Router();
const customPageController = require('../controllers/customPageController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');

// ====================== FRONTEND ====================== //
// Ambil halaman berdasarkan page (frontend)
router.get('/frontend', customPageController.getByPage);

// ====================== ADMIN ====================== //
// Ambil semua custom page
router.get(
  '/',
  requireAuth,
  requireModulePermission("Custome Page", "canView"),
  customPageController.getAll
);

// Ambil detail custom page
router.get(
  '/:id',
  requireAuth,
  requireModulePermission("Custome Page", "canView"),
  customPageController.getById
);

// Buat custom page baru
router.post(
  '/',
  requireAuth,
  requireModulePermission("Custome Page", "canAdd"),
  customPageController.create
);

// Update custom page
router.put(
  '/:id',
  requireAuth,
  requireModulePermission("Custome Page", "canEdit"),
  customPageController.update
);

// Hapus custom page
router.delete(
  '/:id',
  requireAuth,
  requireModulePermission("Custome Page", "canDelete"),
  customPageController.remove
);

// Hapus custom page berdasarkan tag
router.delete(
  '/deleteByTag/:tag',
  requireAuth,
  requireModulePermission("Custome Page", "canDelete"),
  customPageController.deleteByTag
);

module.exports = router;

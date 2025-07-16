const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { requireAuth } = require('../middlewares/authMiddleware');

// ⛔ PASTIKAN tidak ada tanda kurung `()` di sini
router.get('/menu-groups', menuController.getMenuGroups); // ✅ Bukan getMenuGroups()
router.get('/menu-groups/:id', menuController.getMenuGroupById);
router.get('/menu-items/:groupId', menuController.getMenuItemsByGroup);
router.post('/menu-groups/:id/assign', menuController.assignType);
router.post('/menu-groups/:id/unassign', menuController.unassignType);

// Admin
router.get('/admin/menu-groups/:id', requireAuth, menuController.getMenuGroupById);
router.get('/admin/menu-items', requireAuth, menuController.getMenuItemsByQuery);
router.post('/admin/menu-items', requireAuth, menuController.createMenuItem);
router.put('/admin/menu-items/:id', requireAuth, menuController.updateMenuItem);
router.delete('/admin/menu-items/:id', requireAuth, menuController.deleteMenuItem);

module.exports = router;

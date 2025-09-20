const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { requireAuth, requireAdmin, requireModulePermission, requireOtherModule } = require('../middlewares/authMiddleware');

router.get('/menu-list',  menuController.getMenuBySlug);
// router.get('/menu-list-by-type', menuController.getMenuList);
// router.get('/menu-list', menuController.getMenuList);
router.get('/menu-groups', requireAuth, requireModulePermission('Menu', 'canView'), menuController.getMenuGroups); 
router.get('/menu-groups/:id', menuController.getMenuGroupById);
router.get('/menu-items/:groupId', menuController.getMenuItemsByGroup);
router.post('/menu-groups/:id/assign', requireAuth, requireOtherModule('Boleh Assign Menu'), menuController.assignType);
router.post('/menu-groups/:id/unassign', requireAuth, requireOtherModule('Boleh Unassign Menu'), menuController.unassignType);
router.post('/menu-groups', requireAuth, requireModulePermission('Menu', 'canAdd'), menuController.createMenuGroup);
router.get('/menu', menuController.getMenuByGroup);
router.get('/menu/:slug', menuController.getMenuByGroup);

router.get('/footer', menuController.getFooterMenus);

// Admin
// Menu Groups
router.post(
  '/menu-groups',
  requireAuth,
  requireModulePermission('Menu', 'canAdd'),
  menuController.createMenuGroup
);

router.put(
  '/menu-groups/:id',
  requireAuth,
  requireModulePermission('Menu', 'canEdit'),
  menuController.updateMenuGroupHandler
);

router.delete(
  '/menu-groups/:id',
  requireAuth,
  requireModulePermission('Menu', 'canDelete'),
  menuController.deleteMenuGroupHandler
);

// Menu Items
router.get(
  '/admin/menu-items',
  requireAuth,
  requireModulePermission('Menu', 'canView'),
  menuController.getMenuItemsByQuery
);

router.post(
  '/admin/menu-items',
  requireAuth,
  requireModulePermission('Menu', 'canAdd'),
  menuController.createMenuItem
);

router.put(
  '/admin/menu-items/:id',
  requireAuth,
  requireModulePermission('Menu', 'canEdit'),
  menuController.updateMenuItem
);

router.delete(
  '/admin/menu-items/:id',
  requireAuth,
  requireModulePermission('Menu', 'canDelete'),
  menuController.deleteMenuItem
);

// Single Group Detail
router.get(
  '/admin/menu-groups/:id',
  requireAuth,
  requireModulePermission('Menu', 'canView'),
  menuController.getMenuGroupById
);



// Assign / Unassign type (optional, bisa pakai canEdit)
router.post(
  '/menu-groups/:id/assign', requireAdmin,
  requireAuth,
  requireModulePermission('Menu', 'canEdit'),
  menuController.assignType
);

router.post(
  '/menu-groups/:id/unassign',requireAdmin,
  requireAuth,
  requireModulePermission('Menu', 'canEdit'),
  menuController.unassignType
);

module.exports = router;
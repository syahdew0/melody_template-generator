// const express = require('express');
// const router = express.Router();
// const commentController = require('../../controllers/commentController');
// const { requireAuth } = require('../../middlewares/authMiddleware');

// // List semua komentar
// router.get('/', requireAuth, commentController.listAll);

// // Ambil detail komentar
// router.get('/:id', requireAuth, commentController.getDetail);

// // Update status approve/reject
// router.patch('/:id/status', requireAuth, commentController.updateStatus);

// //global
// // Ambil status auto-approve
// router.get('/settings/auto-approve', requireAuth, commentController.getAutoApproveSetting);

// // Update status auto-approve
// router.patch('/settings/auto-approve', requireAuth, commentController.updateAutoApproveSetting);

// module.exports = router;

const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/commentController');
const { requireAuth, requireModulePermission } = require('../../middlewares/authMiddleware');

// Middleware permission khusus komentar
const checkCommentPermission = (action) => requireModulePermission("komentar", action);

// ====================== ADMIN / GLOBAL COMMENT ROUTES ====================== //

// List semua komentar (view)
router.get(
  '/',
  requireAuth,
  checkCommentPermission("canView"),
  commentController.listAll
);

// Ambil detail komentar (view)
router.get(
  '/:id',
  requireAuth,
  checkCommentPermission("canView"),
  commentController.getDetail
);

// Update status approve/reject (edit)
router.patch(
  '/:id/status',
  requireAuth,
  checkCommentPermission("canEdit"),
  commentController.updateStatus
);

// Ambil status auto-approve (view)
router.get(
  '/settings/auto-approve',
  requireAuth,
  checkCommentPermission("canView"),
  commentController.getAutoApproveSetting
);

// Update status auto-approve (edit)
router.patch(
  '/settings/auto-approve',
  requireAuth,
  checkCommentPermission("canEdit"),
  commentController.updateAutoApproveSetting
);

module.exports = router;

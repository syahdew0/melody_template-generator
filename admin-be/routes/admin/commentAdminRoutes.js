const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/commentController');
const { requireAuth } = require('../../middlewares/authMiddleware');

// List semua komentar
router.get('/', requireAuth, commentController.listAll);

// Ambil detail komentar
router.get('/:id', requireAuth, commentController.getDetail);

// Update status approve/reject
router.patch('/:id/status', requireAuth, commentController.updateStatus);

//global
// Ambil status auto-approve
router.get('/settings/auto-approve', requireAuth, commentController.getAutoApproveSetting);

// Update status auto-approve
router.patch('/settings/auto-approve', requireAuth, commentController.updateAutoApproveSetting);

module.exports = router;

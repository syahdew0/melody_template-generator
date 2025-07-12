const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/', requireAuth, requireAdmin, userController.getAllUsers);
router.post('/', requireAuth, requireAdmin, userController.createUser);
router.put('/:id', requireAuth, requireAdmin, userController.updateUser);
router.delete('/:id', requireAuth, requireAdmin, userController.deleteUser);
router.put('/make-admin/:id', requireAuth, requireAdmin, userController.promoteToAdmin);

module.exports = router;

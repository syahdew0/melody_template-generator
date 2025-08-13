const express = require('express');
const router = express.Router();
const customPageController = require('../controllers/customPageController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
router.delete('/deleteByTag/:tag', requireAuth, requireAdmin, customPageController.deleteByTag)

router.get('/frontend', customPageController.getByPage);
router.get('/',requireAuth, requireAdmin, customPageController.getAll);
router.post('/',requireAuth, requireAdmin, customPageController.create);
router.get('/:id', requireAuth, requireAdmin,customPageController.getById);
router.put('/:id',requireAuth, requireAdmin, customPageController.update);
router.delete('/:id',requireAuth, requireAdmin, customPageController.remove);

module.exports = router;

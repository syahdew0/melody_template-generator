const express = require('express');
const router = express.Router();
const customPageController = require('../controllers/customPageController');

router.delete('/deleteByTag/:tag', customPageController.deleteByTag)

router.get('/frontend', customPageController.getByPage);
router.get('/', customPageController.getAll);
router.post('/', customPageController.create);
router.get('/:id', customPageController.getById);
router.put('/:id', customPageController.update);
router.delete('/:id', customPageController.remove);

module.exports = router;

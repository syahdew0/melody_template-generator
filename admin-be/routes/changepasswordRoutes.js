const express = require('express');
const router = express.Router();
const changepasswordController = require('../controllers/changepasswordController');
const authenticateCustomer = require('../middlewares/authCustomer');

router.put('/change-password', authenticateCustomer, changepasswordController.changePassword);
// router.post('/password/send-code', authenticateCustomer, changepasswordController.requestPasswordChangeCode);
router.post('/password/send-code', changepasswordController.requestPasswordChangeCode);
router.post('/password/change-with-code', changepasswordController.changePasswordWithCode);

module.exports = router;
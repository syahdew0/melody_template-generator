const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const authenticateCustomer = require('../middlewares/authCustomer');

router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);

router.get('/me', authenticateCustomer, customerAuthController.me);
router.put('/update', authenticateCustomer, customerAuthController.updateProfile);
router.put('/change-password', authenticateCustomer, customerAuthController.changePassword);

router.post('/email/send-old', authenticateCustomer, customerAuthController.requestEmailVerificationOld);
// router.post('/email/verify-old', authenticateCustomer, customerAuthController.confirmEmailVerificationOld);
router.post('/email/verify-old', authenticateCustomer, customerAuthController.confirmEmailVerificationOld);

router.post('/email/send-new', authenticateCustomer, customerAuthController.requestEmailVerification);
router.post('/email/verify-new', authenticateCustomer, customerAuthController.confirmEmailVerification);

module.exports = router;
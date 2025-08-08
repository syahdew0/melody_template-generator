const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const authenticateCustomer = require('../middlewares/authCustomer');

// Register & Login (tidak butuh token)
router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);

// Hanya 1 /me route yang dilindungi token
router.get('/me', authenticateCustomer, customerAuthController.me);

router.put('/update', authenticateCustomer, customerAuthController.updateProfile)

router.put('/change-password', authenticateCustomer, customerAuthController.changePassword)


module.exports = router;

// routes/customer/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authenticateCustomer = require('../middlewares/authCustomer');

// Customer routes
router.get('/posts', authenticateCustomer, postController.getAll); 
router.get('/posts/category/:slug', authenticateCustomer, postController.getPostsByCategory);
router.get('/post/:slug', authenticateCustomer, postController.getBySlug);

module.exports = router;

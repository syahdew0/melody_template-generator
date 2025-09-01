// routes/customer/postRoutes.js
// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');

// // Customer routes
// router.get('/posts',postController.getAll); 
// router.get('/posts/category/:slug',  postController.getPostsByCategory);
// router.get('/post/:slug', postController.getBySlug);

// module.exports = router;

// routes/customer/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Customer routes
router.get('/', postController.getAll); 
router.get('/category/:slug', postController.getPostsByCategory);
router.get('/:slug', postController.getBySlug);

module.exports = router;

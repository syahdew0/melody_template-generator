// routes/admin/postRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// Admin routes
router.get('/posts', requireAuth, requireAdmin, postController.getAll); // GET all posts, filter via query
router.get('/posts/category/:slug', requireAuth, requireAdmin, postController.getPostsByCategory);
router.get('/slug/:slug', requireAuth, requireAdmin, postController.getBySlug);
router.post('/', requireAuth, requireAdmin, postController.create);
router.put('/:id', requireAuth, requireAdmin, postController.update);
router.delete('/:id', requireAuth, requireAdmin, postController.remove);
router.put('/slug/:slug', requireAuth, requireAdmin, postController.updateBySlug);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');

// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
// const authenticateCustomer = require('../middlewares/authCustomer');


// // Ambil semua post (dengan filter kategori, jika ada)
// // router.get('/posts', postController.getAll);

// // Ambil detail post by slug (misal: /post/slug-berita)
// router.get('/posts/category/:slug', requireAuth, requireAdmin, postController.getPostsByCategory)
// router.get('/slug/:slug', requireAuth, requireAdmin,postController.getBySlug);
// router.get('/category/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/post/:slug/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/post/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/page/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/pages/slug/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/',requireAuth, requireAdmin, postController.getAll);
// router.delete('/slug/:slug',requireAuth, requireAdmin, postController.deleteBySlug)
// router.get('/posts',requireAuth, requireAdm, postController.getAll);
// // router.get('/posts',authenticateCustomer, postController.getAll);
// router.post('/',requireAuth, requireAdmin, postController.create);
// router.put('/:id',requireAuth, requireAdmin, postController.update);
// router.delete('/:id',requireAuth, requireAdmin, postController.remove)
// router.get('/:id',requireAuth, requireAdmin, postController.getById);
// router.put('/slug/:slug',requireAuth, requireAdmin, postController.updateBySlug);

// module.exports = router;
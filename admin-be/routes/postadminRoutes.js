// routes/admin/postRoutes.js
// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');
// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// // Admin routes
// router.get('/posts', requireAuth, requireAdmin, postController.getAll); // GET all posts, filter via query
// router.get('/posts/category/:slug', requireAuth, requireAdmin, postController.getPostsByCategory);
// router.get('/slug/:slug', requireAuth, requireAdmin, postController.getBySlug);
// router.post('/', requireAuth, requireAdmin, postController.create);
// router.put('/:id', requireAuth, requireAdmin, postController.update);
// router.delete('/:id', requireAuth, requireAdmin, postController.remove);
// router.put('/slug/:slug', requireAuth, requireAdmin, postController.updateBySlug);

// module.exports = router;

// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');

// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// // ================== POSTS ==================
// router.get('/posts', requireAuth, requireAdmin, postController.getAll);
// router.get('/posts/category/:slug', requireAuth, requireAdmin, postController.getPostsByCategory);
// router.get('/post/:slug', requireAuth, requireAdmin, postController.getBySlug);
// router.post('/posts', requireAuth, requireAdmin, postController.create);
// router.put('/posts/:id', requireAuth, requireAdmin, postController.update);
// router.delete('/posts/:id', requireAuth, requireAdmin, postController.remove);
// router.delete('/posts/slug/:slug', requireAuth, requireAdmin, postController.deleteBySlug);


// // ================== CATEGORIES ==================
// router.get('/categories', requireAuth, requireAdmin, postController.getAllCategories);
// router.get('/categories/:slug', requireAuth, requireAdmin, postController.getCategoryBySlug);
// router.post('/categories', requireAuth, requireAdmin, postController.createCategory);
// router.put('/categories/:id', requireAuth, requireAdmin, postController.updateCategory);
// router.delete('/categories/:id', requireAuth, requireAdmin, postController.deleteCategory);

// // ================== PAGES ==================
// router.get('/pages', requireAuth, requireAdmin, postController.getAllPages);
// router.get('/pages/:slug', requireAuth, requireAdmin, postController.getPageBySlug);
// router.post('/pages', requireAuth, requireAdmin, postController.createPage);
// router.put('/pages/:id', requireAuth, requireAdmin, postController.updatePage);
// router.delete('/pages/:id', requireAuth, requireAdmin, postController.deletePage);

// // ================== PRODUCTS ==================
// router.get('/products', requireAuth, requireAdmin, postController.getAllProducts);
// router.get('/products/:slug', requireAuth, requireAdmin, postController.getProductBySlug);
// router.post('/products', requireAuth, requireAdmin, postController.createProduct);
// router.put('/products/:id', requireAuth, requireAdmin, postController.updateProduct);
// router.delete('/products/:id', requireAuth, requireAdmin, postController.deleteProduct);

// module.exports = router;



const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');
// const authenticateCustomer = require('../middlewares/authCustomer');


// Ambil semua post (dengan filter kategori, jika ada)
// router.get('/posts', postController.getAll);

// Ambil detail post by slug (misal: /post/slug-berita)
router.get('/', requireAuth, requireAdmin, postController.getAll);
router.get('/posts/category/:slug', requireAuth, requireAdmin, postController.getPostsByCategory)
router.get('/slug/:slug', requireAuth, requireAdmin,postController.getBySlug);
router.get('/category/:slug',requireAuth, requireAdmin, postController.getBySlug);
router.get('/post/:slug/:slug',requireAuth, requireAdmin, postController.getBySlug);
router.get('/post/:slug',requireAuth, requireAdmin, postController.getBySlug);
router.get('/page/:slug',requireAuth, requireAdmin, postController.getBySlug);
router.get('/pages/slug/:slug',requireAuth, requireAdmin, postController.getBySlug);
// router.get('/',requireAuth, requireAdmin, postController.getAll);
router.delete('/slug/:slug',requireAuth, requireAdmin, postController.deleteBySlug)
router.get('/posts',requireAuth, requireAdmin, postController.getAll);
// router.get('/posts',authenticateCustomer, postController.getAll);
router.get('/:id',requireAuth, requireAdmin, postController.getById);
router.post('/',requireAuth, requireAdmin, postController.create);
router.put('/:id',requireAuth, requireAdmin, postController.update);
router.delete('/:id',requireAuth, requireAdmin, postController.remove)

router.put('/slug/:slug',requireAuth, requireAdmin, postController.updateBySlug);

module.exports = router;
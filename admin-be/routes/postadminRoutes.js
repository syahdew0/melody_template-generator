

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

const { requireAuth, } = require('../middlewares/authMiddleware');
// const authenticateCustomer = require('../middlewares/authCustomer');


// Ambil semua post (dengan filter kategori, jika ada)
// router.get('/posts', postController.getAll);

// Ambil detail post by slug (misal: /post/slug-berita)
router.get('/', requireAuth, postController.getAll);
router.get('/posts/category/:slug',requireAuth, postController.getPostsByCategory)
router.get('/slug/:slug', requireAuth,postController.getBySlug);
router.get('/category/:slug',requireAuth, postController.getBySlug);
router.get('/post/:slug/:slug',requireAuth,  postController.getBySlug);
router.get('/post/:slug',requireAuth,  postController.getBySlug);
router.get('/page/:slug',requireAuth, postController.getBySlug);
router.get('/pages/slug/:slug',requireAuth, postController.getBySlug);
// router.get('/',requireAuth, requireAdmin, postController.getAll);
router.delete('/slug/:slug',requireAuth,  postController.deleteBySlug)
router.get('/posts',requireAuth,  postController.getAll);
// router.get('/posts',authenticateCustomer, postController.getAll);
router.get('/:id',requireAuth, postController.getById);
router.post('/',requireAuth,  postController.create);
router.put('/:id',requireAuth, postController.update);
router.delete('/:id',requireAuth,  postController.remove)

router.put('/slug/:slug',requireAuth, postController.updateBySlug);

module.exports = router;

// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');

// const {
//   requireAuth,
//   requireAdmin,
//   requireModulePermission,
//   requireCategoryAccess,
// } = require('../middlewares/authMiddleware');

// // ====================== POST ROUTES ====================== //

// // Ambil semua post (admin) - optional filter by category
// router.get(
//   '/',
//   requireAuth,
//   requireModulePermission("Post", "canView"),
//   postController.getAll
// );

// // Ambil post berdasarkan category slug
// router.get(
//   '/posts/category/:slug',
//   requireAuth,

//   requireModulePermission("Post", "canView"),
//   postController.getPostsByCategory
// );

// // Ambil post berdasarkan slug
// router.get(
//   '/post/:slug',
//   requireAuth,
 
//   requireModulePermission("Post", "canView"),
//   requireCategoryAccess("categoryId"),
//   postController.getBySlug
// );

// // Ambil post berdasarkan ID
// router.get(
//   '/:id',
//   requireAuth,

//   requireModulePermission("Post", "canView"),
//   requireCategoryAccess("categoryId"),
//   postController.getById
// );

// // ====================== CREATE / UPDATE ====================== //

// // Buat post baru
// router.post(
//   '/posts',
//   requireAuth,
  
//   requireModulePermission("Post", "canAdd"),
//   requireCategoryAccess("categoryId"),
//   postController.create
// );

// // Update post berdasarkan ID
// router.put(
//   '/:id',
//   requireAuth,
  
//   requireModulePermission("Post", "canEdit"),
//   requireCategoryAccess("categoryId"),
//   postController.update
// );

// // Update post berdasarkan slug
// router.put(
//   '/slug/:slug',
//   requireAuth,

//   requireModulePermission("Post", "canEdit"),
//   requireCategoryAccess("categoryId"),
//   postController.updateBySlug
// );

// // ====================== DELETE ====================== //

// // Hapus post berdasarkan ID
// router.delete(
//   '/:id',
//   requireAuth,
 
//   requireModulePermission("Post", "canDelete"),
//   requireCategoryAccess("categoryId"),
//   postController.remove
// );

// // Hapus post berdasarkan slug
// router.delete(
//   '/slug/:slug',
//   requireAuth,

//   requireModulePermission("Post", "canDelete"),
//   requireCategoryAccess("categoryId"),
//   postController.deleteBySlug
// );

// module.exports = router;
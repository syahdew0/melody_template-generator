
// const express = require('express');
// const router = express.Router();
// const postController = require('../controllers/postController');

// const { requireAuth, } = require('../middlewares/authMiddleware');
// // const authenticateCustomer = require('../middlewares/authCustomer');


// // Ambil semua post (dengan filter kategori, jika ada)
// // router.get('/posts', postController.getAll);

// // Ambil detail post by slug (misal: /post/slug-berita)
// router.get('/', requireAuth, postController.getAll);
// router.get('/posts/category/:slug',requireAuth, postController.getPostsByCategory)
// router.get('/slug/:slug', requireAuth,postController.getBySlug);
// router.get('/category/:slug',requireAuth, postController.getBySlug);
// router.get('/post/:slug/:slug',requireAuth,  postController.getBySlug);
// router.get('/post/:slug',requireAuth,  postController.getBySlug);
// router.get('/page/:slug',requireAuth, postController.getBySlug);
// router.get('/pages/slug/:slug',requireAuth, postController.getBySlug);
// // router.get('/',requireAuth, requireAdmin, postController.getAll);
// router.delete('/slug/:slug',requireAuth,  postController.deleteBySlug)
// router.get('/posts',requireAuth,  postController.getAll);
// // router.get('/posts',authenticateCustomer, postController.getAll);
// router.get('/:id',requireAuth, postController.getById);
// router.post('/',requireAuth,  postController.create);
// router.put('/:id',requireAuth, postController.update);
// router.delete('/:id',requireAuth,  postController.remove)

// router.put('/slug/:slug',requireAuth, postController.updateBySlug);

// module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

const {
  requireAuth,
  requireModulePermission,
  requireCategoryAccess,
} = require('../middlewares/authMiddleware');

// ====================== POST ROUTES ====================== //

// Ambil semua post (admin) - optional filter by category
router.get(
  '/',
  requireAuth,
  (req, res, next) => {
    const type = req.query.type || 'post';
    if (type === 'page') {
      requireModulePermission("Page", "canView")(req, res, next);
    } else {
      requireModulePermission("Post", "canView")(req, res, next);
    }
  },
  postController.getAll
);


router.get(
  '/posts',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getAll
);

// Ambil post berdasarkan kategori
router.get(
  '/posts/category/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getPostsByCategory
);

// ====================== GET BY SLUG ====================== //

router.get(
  '/slug/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

router.get(
  '/category/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

router.get(
  '/post/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

// nested slug (opsional)
router.get(
  '/post/:categorySlug/:postSlug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

router.get(
  '/page/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

router.get(
  '/pages/slug/:slug',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getBySlug
);

// ====================== GET BY ID ====================== //

router.get(
  '/:id',
  requireAuth,
  requireModulePermission("Post", "canView"),
  postController.getById
);

// ====================== CREATE / UPDATE ====================== //

// sekarang jadi /api/admin/posts
router.post(
  '/',
  requireAuth,
  requireModulePermission("Post", "canAdd"),
  requireCategoryAccess("categoryId"),
  postController.create
);


router.put(
  '/:id',
  requireAuth,
  requireModulePermission("Post", "canEdit"),
  // ambil categoryId di controller, bukan param
  postController.update
);

router.put(
  '/slug/:slug',
  requireAuth,
  requireModulePermission("Post", "canEdit"),
  postController.updateBySlug
);

// ====================== DELETE ====================== //

router.delete(
  '/:id',
  requireAuth,
  requireModulePermission("Post", "canDelete"),
  postController.remove
);

router.delete(
  '/slug/:slug',
  requireAuth,
  requireModulePermission("Post", "canDelete"),
  postController.deleteBySlug
);

module.exports = router;

const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');


// Ambil semua post (dengan filter kategori, jika ada)
// router.get('/posts', postController.getAll);

// Ambil detail post by slug (misal: /post/slug-berita)
router.get('/slug/:slug', postController.getBySlug);
router.get('/category/:slug', postController.getBySlug);
router.get('/post/:slug/:slug', postController.getBySlug);
router.get('/post/:slug', postController.getBySlug);
router.get('/page/:slug', postController.getBySlug);
router.get('/pages/slug/:slug', postController.getBySlug);
router.get('/', postController.getAll);
router.delete('/slug/:slug', postController.deleteBySlug)
router.get('/posts', postController.getAll);
router.post('/', postController.create);
router.put('/:id', postController.update);
router.delete('/:id', postController.remove)
router.get('/:id', postController.getById);

module.exports = router;

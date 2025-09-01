const express = require('express');
const router = express.Router();
const commentController = require('../../controllers/commentController');
// Tambah komentar baru
router.post('/', commentController.create);

// Ambil komentar berdasarkan slug post
router.get('/post/:slug', commentController.getByPostSlug);

module.exports = router;

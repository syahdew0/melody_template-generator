// routes/TestimonialRoutes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

router.get('/', postController.getTestimonials);

module.exports = router;

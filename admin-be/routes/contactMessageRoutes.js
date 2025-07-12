const express = require('express');
const router = express.Router();
const controller = require('../controllers/contactMessageController');

// Public route: pengunjung mengirim pesan
router.post('/contact-submit', controller.submitMessage);

// Admin route: ambil semua pesan
router.get('/admin/contact-messages', controller.getMessages);

// Admin route: hapus pesan
router.delete('/admin/contact-messages/:id', controller.deleteMessage);

module.exports = router;

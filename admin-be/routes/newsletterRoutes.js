const express = require('express');
const router = express.Router();
const controller = require('../controllers/newsletterController');

// Admin endpoints
router.get('/admin/newsletter-settings', controller.getSettings);
router.put('/admin/newsletter-settings', controller.updateSettings);
router.get('/admin/newsletter-subscribers', controller.getSubscribers);
router.delete('/admin/newsletter-subscribers/:id', controller.deleteSubscriber);

// Public
router.post('/newsletter-submit', controller.subscribe);

module.exports = router;

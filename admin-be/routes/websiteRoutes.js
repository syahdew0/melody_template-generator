// routes/websiteRoutes.js
const express = require('express');
const router = express.Router();
const websiteController = require('../controllers/websiteController');


router.get('/', websiteController.getAllWebsites);
router.get('/:id', websiteController.getWebsiteById);
router.post('/', websiteController.createWebsite);
router.put('/:id', websiteController.updateWebsite);
router.delete('/:id', websiteController.deleteWebsite);

// Optional shortcut
router.get('/:id/active-theme', websiteController.getActiveTheme);


// router.put('/websites/:id/schema', websiteController.updateSchema);
// router.get('/websites/:id/schema', websiteController.getSchema); 


module.exports = router;

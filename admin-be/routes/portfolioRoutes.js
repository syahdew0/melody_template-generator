const express = require('express');
const router = express.Router();
const controller = require('../controllers/portfolioController');

// Routes untuk header
router.get('/header', controller.getHeader);
router.put('/header', controller.updateHeader);

// Routes untuk item grid
router.get('/items', controller.getItems);
router.post('/items', controller.createItem);
router.put('/items/:id', controller.updateItem);
router.delete('/items/:id', controller.deleteItem);

module.exports = router;

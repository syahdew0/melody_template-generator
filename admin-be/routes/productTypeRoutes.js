// routes/productTypeRoutes.js
const express = require('express');
const router = express.Router();
const productTypeController = require('../controllers/productTypeController');

// GET all product types
router.get('/', productTypeController.getAll);

// GET single product type by ID
router.get('/:id', productTypeController.getById);

// CREATE new product type
router.post('/', productTypeController.create);

// UPDATE product type
router.put('/:id', productTypeController.update);

// DELETE product type
router.delete('/:id', productTypeController.delete);

module.exports = router;

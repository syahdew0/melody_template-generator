const express = require('express');
const router = express.Router();
const BrandController = require('../controllers/BrandController');

router.get('/', BrandController.getAll);                 // GET all brands
router.get('/id/:id', BrandController.getById);         // GET brand by ID
router.get('/slug/:slug', BrandController.getBySlug);   // GET brand by slug
router.post('/', BrandController.create);               // POST create brand
router.put('/:id', BrandController.update);             // PUT update brand
router.delete('/:id', BrandController.delete);          // DELETE brand

module.exports = router;

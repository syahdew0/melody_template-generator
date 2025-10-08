const express = require('express');
const router = express.Router();
const productVariantController = require('../../controllers/customer/ProductVariantController');

router.get('/:id/variants', productVariantController.getProductVariants);
router.get('/', productVariantController.getPublishedProducts);

module.exports = router;

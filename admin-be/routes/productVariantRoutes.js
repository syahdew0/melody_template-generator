const router = require('express').Router()
const controller = require('../controllers/productVariantController')

// Variants
router.post('/products/:productId/variants/combinations', controller.createCombinations)
router.get('/products/:productId/variants', controller.getVariants)
router.post('/products/:productId/variants', controller.createVariant)
router.put('/variants/:id', controller.updateVariant)
router.delete('/variants/:id', controller.deleteVariant)

// Options
router.post('/products/:productId/variant-options', controller.createOption)
router.get('/products/:productId/variant-options', controller.listOptions)

// Values
router.post('/variant-options/:optionId/values', controller.createValue)
router.get('/variant-options/:optionId/values', controller.listValues)

module.exports = router

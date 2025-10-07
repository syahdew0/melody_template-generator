
const { ProductVariant, ProductVariantOption, ProductVariantValue, Post } = require('../models')

module.exports = {
  // Product Variants
async getVariants(req, res) {
    try {
      const { productId } = req.params

      // Ambil semua variant beserta values dan option
      const variants = await ProductVariant.findAll({
        where: { product_id: productId },
        include: [
          {
            model: ProductVariantValue,
            as: 'values',
            include: [{ model: ProductVariantOption, as: 'option' }]
          }
        ],
        order: [['id', 'ASC']]
      })

      // Mapping variant ke format frontend-friendly
      const data = variants.map(v => ({
        id: v.id,
        product_id: v.product_id,
        combination: v.combination,
        sku: v.sku,
        price: Number(v.price),
        stock: Number(v.stock),
        image: v.image,
        values: (v.values || []).map(val => ({
          value: val.value,
          option: val.option?.name || 'Unknown'
        }))
      }))

      // Mapping attributes unik
      const attrMap = {}
      data.forEach(v => {
        v.values.forEach(val => {
          if (!attrMap[val.option]) attrMap[val.option] = new Set()
          attrMap[val.option].add(val.value)
        })
      })
      const attributes = Object.entries(attrMap).map(([name, set]) => ({
        name,
        options: Array.from(set)
      }))

      res.json({ data, attributes })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
,

  async createVariant(req, res) {
  try {
    const { productId } = req.params
    const { combination, sku, price, stock, image } = req.body

    const product = await Post.findByPk(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const variant = await ProductVariant.create({
  product_id: productId,
  combination: combo.values
    ? combo.values.map(v => (typeof v === 'string' ? v : v.value)).join(',')
    : '',
  price: combo.price || 0,
  stock: combo.stock || 0,
  image: combo.image || null
})

    // Simpan variant values
    if (combination && Array.isArray(combination)) {
      for (const item of combination) {
        await ProductVariantValue.create({
          variant_id: variant.id,
          option_id: item.option_id,
          value: item.value
        })
      }
    }

    const savedVariant = await ProductVariant.findByPk(variant.id, {
      include: [
        { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
      ]
    })

    res.status(201).json({ data: savedVariant })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
},
 async createCombinations(req, res) {
    try {
      const { productId } = req.params
      const { variants } = req.body

      if (!variants || !Array.isArray(variants) || !variants.length) {
        return res.status(400).json({ message: 'Variants harus berupa array dan tidak kosong' })
      }

      const product = await Post.findByPk(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })

      const savedVariants = []

      for (const combo of variants) {
        if (!combo.values || !Array.isArray(combo.values) || !combo.values.length) continue

        // Buat atau ambil option untuk setiap value
        const valueObjects = []
        for (const val of combo.values) {
          const optionName = val.option || val.value
          let option = await ProductVariantOption.findOne({
            where: { product_id: productId, name: optionName }
          })
          if (!option) {
            option = await ProductVariantOption.create({
              product_id: productId,
              name: optionName
            })
          }
          valueObjects.push({ option, value: val.value })
        }

        // Simpan variant utama
        const combinationStr = valueObjects.map(v => v.value).join(',')
        const variant = await ProductVariant.create({
          product_id: productId,
          combination: combinationStr,
          price: combo.price || 0,
          stock: combo.stock || 0,
          image: combo.image || null
        })

        // Simpan variant values
        for (const vo of valueObjects) {
          await ProductVariantValue.create({
            variant_id: variant.id,
            option_id: vo.option.id,
            value: vo.value
          })
        }

        savedVariants.push(variant)
      }

      // Ambil semua variant lengkap
      const allVariants = await ProductVariant.findAll({
        where: { product_id: productId },
        include: [
          {
            model: ProductVariantValue,
            as: 'values',
            include: [{ model: ProductVariantOption, as: 'option' }]
          }
        ]
      })

      res.status(201).json({ message: 'Combinations saved', data: allVariants })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
,

 async updateVariant(req, res) {
    try {
      const { id } = req.params
      const { combination, sku, price, stock, image } = req.body

      const variant = await ProductVariant.findByPk(id)
      if (!variant) return res.status(404).json({ message: 'Variant not found' })

      // Pastikan combination iterable
      const combinationStr = Array.isArray(combination)
        ? combination.map(c => (typeof c === 'object' ? c.value : c)).join(',')
        : variant.combination

      // Update variant utama
      await variant.update({
        combination: combinationStr,
        sku: sku || variant.sku,
        price: price != null ? price : variant.price,
        stock: stock != null ? stock : variant.stock,
        image: image || variant.image
      })

      // Hapus variant values lama
      await ProductVariantValue.destroy({ where: { variant_id: variant.id } })

      // Simpan variant values baru
      if (Array.isArray(combination)) {
        for (const item of combination) {
          // Pastikan option ada
          const optionName = item.option || item.value
          let option = await ProductVariantOption.findOne({
            where: { product_id: variant.product_id, name: optionName }
          })
          if (!option) {
            option = await ProductVariantOption.create({
              product_id: variant.product_id,
              name: optionName
            })
          }

          await ProductVariantValue.create({
            variant_id: variant.id,
            option_id: option.id,
            value: item.value
          })
        }
      }

      // Ambil variant lengkap
      const updatedVariant = await ProductVariant.findByPk(variant.id, {
        include: [
          { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
        ]
      })

      res.json({ data: updatedVariant })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async deleteVariant(req, res) {
    try {
      const { id } = req.params
      const variant = await ProductVariant.findByPk(id)
      if (!variant) return res.status(404).json({ message: 'Variant not found' })

      await variant.destroy()
      res.json({ message: 'Variant deleted' })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  // Variant Options
  async createOption(req, res) {
    try {
      const { productId } = req.params
      const { name } = req.body

      const product = await Post.findByPk(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })

      const option = await ProductVariantOption.create({ product_id: productId, name })
      res.status(201).json({ data: option })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async listOptions(req, res) {
    try {
      const { productId } = req.params
      const options = await ProductVariantOption.findAll({
        where: { product_id: productId },
        include: [{ model: ProductVariantValue, as: 'values' }]
      })
      res.json({ data: options })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  // Variant Values
  async createValue(req, res) {
    try {
      const { optionId } = req.params
      const { value } = req.body

      const option = await ProductVariantOption.findByPk(optionId)
      if (!option) return res.status(404).json({ message: 'Option not found' })

      const variantValue = await ProductVariantValue.create({ option_id: optionId, value })
      res.status(201).json({ data: variantValue })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async listValues(req, res) {
    try {
      const { optionId } = req.params
      const values = await ProductVariantValue.findAll({ where: { option_id: optionId } })
      res.json({ data: values })
    } catch (err) {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
}
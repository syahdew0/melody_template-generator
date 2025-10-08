const { ProductVariant, ProductVariantOption, ProductVariantValue, Post } = require('../models')

module.exports = {

  async getVariants(req, res) {
    try {
      const { productId } = req.params

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

      // Kumpulkan attributes unik
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
      console.error('Error getVariants:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

async createCombinations(req, res) {
  try {
    const { productId } = req.params
    const { variants } = req.body

    // Validasi awal
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: 'Variants harus berupa array dan tidak boleh kosong' })
    }

    // Pastikan produk ada
    const product = await Post.findByPk(productId)
    if (!product) return res.status(404).json({ message: 'Product not found' })

    const savedVariants = []

    // Loop setiap kombinasi varian
    for (const combo of variants) {
      if (!combo.values || !Array.isArray(combo.values)) continue

      const valueObjects = []

      // Loop tiap value (misal Warna: Merah, Ukuran: XL)
      for (const val of combo.values) {
        const optionName = val.option?.trim()
        const valueName = val.value?.trim()
        if (!optionName || !valueName) continue

        // Cari atau buat option (misal: Warna, Ukuran)
        let option = await ProductVariantOption.findOne({
          where: { product_id: productId, name: optionName }
        })

        if (!option) {
          option = await ProductVariantOption.create({
            product_id: productId,
            name: optionName
          })
        }

        valueObjects.push({ option, value: valueName })
      }

      if (!valueObjects.length) continue

      // Gabungkan nilai-nilai (misal: Merah,XL)
      const combinationStr = valueObjects.map(v => v.value).join(', ')

      // Simpan variant utama
      const variant = await ProductVariant.create({
        product_id: productId,
        combination: combinationStr,
        sku: combo.sku || null,
        price: combo.price || 0,
        stock: combo.stock || 0,
        image: combo.image || null
      })

      // Simpan hubungan value (ProductVariantValue)
      for (const vo of valueObjects) {
        await ProductVariantValue.create({
          variant_id: variant.id,
          option_id: vo.option.id, 
          value: vo.value
        })
      }

      savedVariants.push(variant)
    }

    // Ambil ulang semua varian untuk respon
    const allVariants = await ProductVariant.findAll({
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

    res.status(201).json({
      message: 'Combinations saved successfully',
      data: allVariants
    })
  } catch (err) {
    console.error(' Error createCombinations:', err)
    res.status(500).json({ message: 'Internal server error', error: err.message })
  }
},

  async createVariant(req, res) {
    try {
      const { productId } = req.params
      const { combination, sku, price, stock, image } = req.body

      const product = await Post.findByPk(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })

      const variant = await ProductVariant.create({
        product_id: productId,
        combination: Array.isArray(combination)
          ? combination.map(v => (typeof v === 'string' ? v : v.value)).join(',')
          : combination || '',
        sku: sku || null,
        price: price || 0,
        stock: stock || 0,
        image: image || null
      })

      // Simpan variant values
      if (Array.isArray(combination)) {
        for (const item of combination) {
          await ProductVariantValue.create({
             variant_id: variant.id,
            variant_option_id: item.option_id,
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
      console.error('Error createVariant:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async updateVariant(req, res) {
    try {
      const { id } = req.params
      const { combination, sku, price, stock, image } = req.body

      const variant = await ProductVariant.findByPk(id)
      if (!variant) return res.status(404).json({ message: 'Variant not found' })

      const combinationStr = Array.isArray(combination)
        ? combination.map(c => (typeof c === 'object' ? c.value : c)).join(',')
        : variant.combination

      await variant.update({
        combination: combinationStr,
        sku: sku || variant.sku,
        price: price ?? variant.price,
        stock: stock ?? variant.stock,
        image: image || variant.image
      })

      // Hapus values lama
      await ProductVariantValue.destroy({ where: { product_variant_id: variant.id } })

      if (Array.isArray(combination)) {
        for (const item of combination) {
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
            variant_option_id: option.id,
            value: item.value
          })
        }
      }

      const updatedVariant = await ProductVariant.findByPk(variant.id, {
        include: [
          { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
        ]
      })

      res.json({ data: updatedVariant })
    } catch (err) {
      console.error('Error updateVariant:', err)
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
      console.error('Error deleteVariant:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },


  async createOption(req, res) {
    try {
      const { productId } = req.params
      const { name } = req.body

      const product = await Post.findByPk(productId)
      if (!product) return res.status(404).json({ message: 'Product not found' })

      const option = await ProductVariantOption.create({ product_id: productId, name })
      res.status(201).json({ data: option })
    } catch (err) {
      console.error('Error createOption:', err)
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
      console.error('Error listOptions:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async createValue(req, res) {
    try {
      const { optionId } = req.params
      const { value } = req.body

      const option = await ProductVariantOption.findByPk(optionId)
      if (!option) return res.status(404).json({ message: 'Option not found' })

      const variantValue = await ProductVariantValue.create({
        product_variant_option_id: optionId,
        value
      })
      res.status(201).json({ data: variantValue })
    } catch (err) {
      console.error('Error createValue:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  },

  async listValues(req, res) {
    try {
      const { optionId } = req.params
      const values = await ProductVariantValue.findAll({
        where: { product_variant_option_id: optionId }
      })
      res.json({ data: values })
    } catch (err) {
      console.error('Error listValues:', err)
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
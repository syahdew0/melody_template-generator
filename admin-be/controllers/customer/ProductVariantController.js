const { Post: Product, ProductVariant, ProductVariantValue, ProductVariantOption } = require('../../models');
const { Op } = require('sequelize');

// Dapatkan varian produk berdasarkan post.id
exports.getProductVariants = async (req, res) => {
  try {
    const { id } = req.params
    const product = await Product.findByPk(id)
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" })
    }

    const variants = await ProductVariant.findAll({
      where: { product_id: id },
      include: [
        {
          model: ProductVariantValue,
          as: 'values',
          include: [
            {
              model: ProductVariantOption,
              as: 'option',
              attributes: ['name']
            }
          ]
        }
      ]
    })

    const attributes = []
    variants.forEach(v => {
      v.values.forEach(val => {
        const optName = val.option?.name
        if (!optName) return
        let attr = attributes.find(a => a.name === optName)
        if (!attr) {
          attr = { name: optName, options: [] }
          attributes.push(attr)
        }
        if (!attr.options.includes(val.value)) attr.options.push(val.value)
      })
    })

    return res.json({
      success: true,
      data: variants,
      attributes
    })
  } catch (err) {
    console.error("Error getProductVariants:", err)
    res.status(500).json({
      success: false,
      message: "Gagal mengambil varian produk",
      error: err.message
    })
  }
}

exports.getPublishedProducts = async (req, res) => {
  try {
    const products = await Post.findAll({
      where: { type: 'product', status: 'published' },
      order: [['created_at', 'DESC']],
    });

    res.json({
      success: true,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar produk',
      error: error.message,
    });
  }
};
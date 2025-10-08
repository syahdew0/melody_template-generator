const { Post, PostMeta, Category, ProductDetail, PostCategory, ProductType,  ProductVariant, ProductVariantValue, ProductVariantOption } = require('../models')
const { Op } = require('sequelize')
const cron = require('node-cron');

const formatVariants = (variants) => {
  return variants.map(v => ({
    id: v.id,
    combination: v.combination,
    sku: v.sku,
    price: v.price,
    stock: v.stock,
    image: v.image,
    values: (v.values || []).map(val => ({
      value: val.value,
      option: val.option?.name || val.option  
    }))
  }));
};

exports.index = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: { status: 'published' },
      include: [
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            {
              model: ProductType,
              as: 'product_type',
              attributes: ['id', 'name', 'parent_id'],
              include: [
                { model: ProductType, as: 'parent', attributes: ['id', 'name'] },
                { model: ProductType, as: 'children', attributes: ['id', 'name'] }
              ]
            }
          ]
        },
        { model: Category, as: 'categories' }
      ]
    });

    const data = posts.map(post => {
      let final_price = null;
      let original_price = null;

      if (post.product_detail) {
        const { price, discount_price, discount_until } = post.product_detail;

        original_price = price;
        final_price = price;

        if (discount_price && discount_until && new Date(discount_until) > new Date()) {
          final_price = discount_price;
        }
      }

      return {
        ...post.toJSON(),
        product_detail: {
          ...post.product_detail?.toJSON(),
          original_price,
          final_price
        }
      };
    });

    res.json(data);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

cron.schedule('0 * * * *', async () => {
  try {
    const now = new Date();

    const [updatedCount] = await ProductDetail.update(
      {
        discount_price: null,
        discount_until: null
      },
      {
        where: {
          discount_until: { [Op.lt]: now }
        }
      }
    );

    if (updatedCount > 0) {
      console.log(`[CRON] ${updatedCount} produk expired discount dibersihkan (${now.toISOString()})`);
    }
  } catch (err) {
    console.error('[CRON] Error saat bersihkan discount:', err);
  }
});


// CREATE
exports.create = async (req, res) => {
  try {
    const {
      website_id, user_id, title, slug, content, excerpt,
      thumbnail_url, status, type, template, parent_id,
      meta = [], product_detail = {}, category_ids = [], variations = []
    } = req.body;

    // Buat slug unik
    const slugify = (text) => text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    let baseSlug = slug && slug !== '' ? slugify(slug) : slugify(title || 'untitled');
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    // CREATE POST
    const post = await Post.create({
      website_id, user_id, title, slug: finalSlug, content, excerpt,
      thumbnail_url, status, published_at: status === 'published' ? new Date() : null,
      type, template, parent_id
    });

    // META
    if (meta.length > 0) {
      const metas = meta.map(m => ({ post_id: post.id, meta_key: m.meta_key, meta_value: m.meta_value }));
      await PostMeta.bulkCreate(metas);
    }

    // CATEGORY
    if (category_ids.length) await post.setCategories(category_ids);

    // PRODUCT DETAIL + VARIANTS
    if (type === 'product') {
      const detail = await ProductDetail.create({ ...product_detail, post_id: post.id });

      if (Array.isArray(variations) && variations.length) {
        for (const v of variations) {
          const variant = await ProductVariant.create({
            product_id: post.id,
            combination: v.values.map(i => `${i.option}:${i.value}`).join(', '),
            sku: v.sku || null,
            price: Number(v.price || 0),
            stock: Number(v.stock || 0),
            image: v.image || null
          });

          for (const val of v.values) {
            let option = await ProductVariantOption.findOne({
              where: { product_id: post.id, name: val.option }
            });
            if (!option) {
              option = await ProductVariantOption.create({ product_id: post.id, name: val.option });
            }

            await ProductVariantValue.create({
              variant_id: variant.id,
              option_id: option.id,
              value: val.value
            });
          }
        }
      }
    }

    // Ambil ulang post lengkap dengan variants
    const createdPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: PostMeta, as: 'meta' },
        { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            {
              model: ProductVariant,
              as: 'variations',
              include: [
                { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
              ]
            }
          ]
        }
      ]
    });

    const postJSON = createdPost.toJSON();
    if (postJSON.product_detail?.variations) {
      postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
    }

    res.status(201).json({ message: 'Post created successfully', data: postJSON });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};
// GET ALL 
exports.getAll = async (req, res) => {
  try {
    const { slug, type, page = 1, limit = 10 } = req.query;
    const where = { status: 'published' };
    if (type) where.type = type;
    if (slug) where.slug = slug;

    const offset = (page - 1) * limit;

    const include = [
      { model: PostMeta, as: 'meta' },
      { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
      {
        model: ProductDetail,
        as: 'product_detail',
        include: [
          {
            model: ProductVariant,
            as: 'variations',
            include: [{ model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }]
          },
          { model: ProductType, as: 'product_type', attributes: ['id','name','parent_id'] }
        ]
      }
    ];

    if (slug) {
      const post = await Post.findOne({ where, include });
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const postJSON = post.toJSON();
      if(postJSON.product_detail?.variations) {
        postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
      }
      return res.json({ data: [postJSON], total: 1 });
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      distinct: true,
      order: [['created_at', 'DESC']]
    });

    const data = rows.map(post => {
      const p = post.toJSON();
      if(p.product_detail?.variations) {
        p.product_detail.variations = formatVariants(p.product_detail.variations);
      }
      return p;
    });

    res.json({ data, total: count });
  } catch (err) {
    console.error('Error getAll:', err);
    res.status(500).json({ message: err.message });
  }
};
// GET BY ID
exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findOne({
      where: { id, status: 'published' },
      include: [
        { model: PostMeta, as: 'meta' },
        { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            { model: ProductType, as: 'product_type', attributes: ['id','name','parent_id'] },
            { model: ProductVariant, as: 'variations', include: [{ model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }] }
          ]
        }
      ]
    });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const postJSON = post.toJSON();
    if (postJSON.product_detail?.variations) postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
    res.json(postJSON);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const postId = req.params.id;
    const {
      website_id, user_id, title, slug, content, excerpt,
      thumbnail_url, status, type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body;
    const variations = product_detail.variations || [];

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // UPDATE POST
    await post.update({
      website_id,
      user_id,
      title,
      slug: slug || post.slug,
      content: content !== undefined ? content : post.content,
      excerpt,
      thumbnail_url,
      status,
      published_at: status === 'published' ? (post.published_at || new Date()) : null,
      type,
      template,
      parent_id
    });

    // META
    await PostMeta.destroy({ where: { post_id: postId } });
    if (meta.length > 0) {
      const metas = meta.map(m => ({ post_id: postId, meta_key: m.meta_key, meta_value: m.meta_value }));
      await PostMeta.bulkCreate(metas);
    }

    // CATEGORY
    if (category_ids?.length > 0) await post.setCategories(category_ids);

    // PRODUCT DETAIL + VARIANTS
    if (type === 'product') {
      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: post.id },
        defaults: { ...product_detail, post_id: post.id }
      });
      if (!created) await detail.update(product_detail);

      for (const v of variations) {
  let variant;
  if (v.id) {
    // Update varian lama
    variant = await ProductVariant.findByPk(v.id);
    if (variant) {
      await variant.update({
        combination: v.values.map(i => `${i.option}:${i.value}`).join(', '),
        sku: v.sku || null,
        price: Number(v.price || 0),
        stock: Number(v.stock || 0),
        image: v.image || null
      });
    }
  }
  
  if (!variant) {
    // Buat varian baru
    variant = await ProductVariant.create({
      product_id: post.id,
      combination: v.values.map(i => `${i.option}:${i.value}`).join(', '),
      sku: v.sku || null,
      price: Number(v.price || 0),
      stock: Number(v.stock || 0),
      image: v.image || null
    });
  }

  // Handle values
  for (const val of v.values) {
    let option = await ProductVariantOption.findOne({
      where: { product_id: post.id, name: val.option }
    });
    if (!option) {
      option = await ProductVariantOption.create({ product_id: post.id, name: val.option });
    }

    if (val.id) {
      // Update value lama
      const variantValue = await ProductVariantValue.findByPk(val.id);
      if (variantValue) {
        await variantValue.update({
          value: val.value,
          option_id: option.id
        });
        continue;
      }
    }

    // Buat value baru
    await ProductVariantValue.create({
      variant_id: variant.id,
      option_id: option.id,
      value: val.value
    });
  }
}
    }

    // Ambil ulang post lengkap
    const updatedPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: PostMeta, as: 'meta' },
        { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            {
              model: ProductVariant,
              as: 'variations',
              include: [
                { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
              ]
            }
          ]
        }
      ]
    });

    const postJSON = updatedPost.toJSON();
    if (postJSON.product_detail?.variations) {
      postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
    }

    res.json({ message: 'Post updated successfully', data: postJSON });

  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
};

// DELETE
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    // Hapus semua relasi secara manual
    await PostMeta.destroy({ where: { post_id: id } });
    await ProductDetail.destroy({ where: { post_id: id } });
    await PostCategory.destroy({ where: { post_id: id } });

    // Baru hapus post
    await Post.destroy({ where: { id } });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug, status: 'published' },
      include: [
        { model: PostMeta, as: 'meta' },
        { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            { model: ProductType, as: 'product_type', attributes: ['id','name','parent_id'] },
            {
              model: ProductVariant,
              as: 'variations',
              include: [{ model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }]
            }
          ]
        }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });

    const postJSON = post.toJSON();
    if(postJSON.product_detail?.variations) {
      postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
    }

    res.json(postJSON);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
exports.deleteBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ where: { slug: req.params.slug, type: 'page' } })
    if (!post) return res.status(404).json({ message: 'Page not found' })

    await post.destroy()
    res.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' })
  }
}

exports.updateBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const {
      website_id, user_id, title, slug: newSlug, content,
      excerpt, thumbnail_url, status, type, template, parent_id,
      meta = [], product_detail = {}, category_ids = [], variations = []
    } = req.body;

    const post = await Post.findOne({ where: { slug } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // UPDATE POST
    await post.update({
      website_id,
      user_id,
      title,
      slug: newSlug || slug,
      content: content !== undefined ? content : post.content,
      excerpt,
      thumbnail_url,
      status,
      published_at: status === 'published' ? (post.published_at || new Date()) : null,
      type,
      template,
      parent_id
    });

    // META
    await PostMeta.destroy({ where: { post_id: post.id } });
    if (meta.length > 0) {
      const metas = meta.map(m => ({ post_id: post.id, meta_key: m.meta_key, meta_value: m.meta_value }));
      await PostMeta.bulkCreate(metas);
    }

    // CATEGORY
    if (category_ids?.length > 0) {
      await post.setCategories(category_ids);
    }

    // PRODUCT DETAIL + VARIANTS
    if (type === 'product') {
      // DETAIL
      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: post.id },
        defaults: { ...product_detail, post_id: post.id }
      });
      if (!created) await detail.update(product_detail);

      // HAPUS VARIANT LAMA + VALUES
      const oldVariants = await ProductVariant.findAll({ where: { product_id: post.id } });
      if (oldVariants.length) {
        const oldVariantIds = oldVariants.map(v => v.id);
        await ProductVariantValue.destroy({ where: { variant_id: oldVariantIds } });
        await ProductVariant.destroy({ where: { id: oldVariantIds } });
      }

      // TAMBAH VARIANT BARU
      if (Array.isArray(variations) && variations.length) {
        for (const v of variations) {
          const variant = await ProductVariant.create({
            product_id: post.id,
            combination: v.values.map(i => i.value).join(','),
            sku: v.sku || null,
            price: Number(v.price || 0),
            stock: Number(v.stock || 0),
            image: v.image || null
          });

          for (const val of v.values) {
            const optionName = val.option || 'Default';
            let option = await ProductVariantOption.findOne({
              where: { product_id: post.id, name: optionName }
            });
            if (!option) {
              option = await ProductVariantOption.create({ product_id: post.id, name: optionName });
            }

            await ProductVariantValue.create({
              variant_id: variant.id,
              option_id: option.id,
              value: val.value
            });
          }
        }
      }
    }

    // Ambil ulang post lengkap dengan variants
    const updatedPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: PostMeta, as: 'meta' },
        { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            {
              model: ProductVariant,
              as: 'variations',
              include: [
                { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
              ]
            }
          ]
        }
      ]
    });

    // Format variants untuk frontend
    const formatVariants = (variants) => variants.map(v => ({
      id: v.id,
      combination: v.combination,
      sku: v.sku,
      price: Number(v.price),
      stock: Number(v.stock),
      image: v.image,
      values: (v.values || []).map(val => ({
        value: val.value,
        option: val.option?.name || 'Unknown'
      }))
    }));

    const postJSON = updatedPost.toJSON();
    if (postJSON.product_detail?.variations) {
      postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
    }

    res.json({ message: 'Post updated successfully', data: postJSON });

  } catch (err) {
    console.error('Error updating post by slug:', err);
    res.status(500).json({ message: 'Error updating post', error: err.message });
  }
};


exports.getPostsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    // Cari kategori berdasarkan slug
    const category = await Category.findOne({ where: { slug } });
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' });
    }

    // Ambil semua post published yang termasuk kategori ini
    const posts = await Post.findAll({
      where: { status: 'published' },
      include: [
        {
          model: PostCategory,
          as: 'post_categories',
          required: true, // hanya ambil post yang ada di kategori ini
          where: { category_id: category.id },
          include: [{ model: Category, as: 'category' }],
        },
       {
  model: ProductDetail,
  as: 'product_detail',
  include: [
    { model: ProductType, as: 'product_type', attributes: ['id','name'] }
  ]
},
        { model: PostMeta, as: 'meta' },
      ],
      order: [['created_at', 'DESC']],
    });

    return res.json({ category, posts });
  } catch (error) {
    console.error('Error getPostsByCategory:', error);
    res.status(500).json({ message: 'Gagal mengambil postingan' });
  }
};

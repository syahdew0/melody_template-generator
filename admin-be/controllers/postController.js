const { Post, PostMeta, Category, ProductDetail, PostCategory,ProductType } = require('../models')
const { Op } = require('sequelize')
const cron = require('node-cron');

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


exports.create = async (req, res) => {
  
  try {
    const {
      website_id, user_id, title,  slug, content, excerpt, thumbnail_url,status, type, template, parent_id,meta = [], product_detail = {},category_ids = []
    } = req.body;

      console.log("category_ids parsed:", category_ids); 

    // slugify helper
    const slugify = (text) =>
      text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-');

    // generate slug unik
    let baseSlug = slug && slug !== '' ? slugify(slug) : slugify(title || 'untitled');
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }
let categoryIds = [];
if (Array.isArray(category_ids)) {
  categoryIds = category_ids.map(id => Number(id));
} else if (typeof category_ids === 'string') {
  try {
    categoryIds = JSON.parse(category_ids);
  } catch (e) {
    categoryIds = category_ids.split(',').map(id => Number(id.trim()));
  }
}

// Kalau kosong, kasih default []
if (!Array.isArray(categoryIds)) categoryIds = [];

    // buat post
    const post = await Post.create({
      website_id,
      user_id,
      title,
      slug: finalSlug,
      content,
      excerpt,
      thumbnail_url,
      status,
      published_at: status === 'published' ? new Date() : null,
      type,
      template,
      parent_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    // insert META
    if (meta.length > 0) {
      const metas = meta.map((m) => ({
        post_id: post.id,
        meta_key: m.meta_key,
        meta_value: m.meta_value,
      }));
      await PostMeta.bulkCreate(metas);
    }

if (categoryIds.length > 0) {
  const data = categoryIds.map((category_id) => ({
    post_id: post.id,
    category_id,
  }));
  await PostCategory.bulkCreate(data);
}

    // insert PRODUCT DETAIL
    if (type === 'product' && product_detail) {
      const {
        discount_percentage, // hapus jika ada
        isDiscountActive,    // hapus jika ada
        ...dbProductDetail
      } = product_detail;

      // pastikan product_type_id disertakan
      if (product_detail.product_type_id) {
        dbProductDetail.product_type_id = product_detail.product_type_id;
      }

      await ProductDetail.create({
        ...dbProductDetail,
        post_id: post.id,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

// GET ALL 
exports.getAll = async (req, res) => {
  try {
    const { slug, type, page = 1, limit = 10 } = req.query;

    const where = { status: { [Op.in]: ['published'] } };
    if (type) where.type = type;
    if (slug) where.slug = slug;

    const offset = (page - 1) * limit;

    const include = [
      { model: PostMeta, as: 'meta' },
      {
        model: PostCategory,
        as: 'post_categories',
        required: false,
        include: [{ model: Category, as: 'category' }]
      },
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
      }
    ];

    if (slug) {
      const post = await Post.findOne({ where, include });
      if (!post) return res.status(404).json({ message: 'Post not found' });
      return res.json({ data: [post], total: 1 });
    }

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      offset,
      limit: parseInt(limit),
      distinct: true,
      order: [['created_at', 'DESC']]
    });

    res.json({ data: rows, total: count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
// GET BY ID
// GET BY ID
exports.getById = async (req, res) => {
  try {
    const post = await Post.findOne({
      where: { id: req.params.id },
      include: [
        { model: PostMeta, as: 'meta' },
        {
          model: PostCategory,
          as: 'post_categories',
          include: [{ model: Category, as: 'category' }]
        },
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
        }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// UPDATE
exports.update = async (req, res) => {
  try {
    const postId = req.params.id;
    const {
      website_id,
      user_id,
      title,
      slug,
      content,
      excerpt,
      thumbnail_url,
      status,
      type,
      template,
      parent_id,
      meta = [],
      product_detail = {},
      category_ids = []
    } = req.body;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // update post utama
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

    // update META
    await PostMeta.destroy({ where: { post_id: postId } });
    if (meta.length > 0) {
      const metas = meta.map((m) => ({
        post_id: postId,
        meta_key: m.meta_key,
        meta_value: m.meta_value,
      }));
      await PostMeta.bulkCreate(metas);
    }

    // update CATEGORY
    if (category_ids?.length > 0) {
      await post.setCategories(category_ids);
    }

    // update PRODUCT DETAIL
    if (type === 'product') {
      const { discount_percentage, isDiscountActive, ...dbProductDetail } = product_detail;

      // pastikan product_type_id disertakan
      if (product_detail.product_type_id) {
        dbProductDetail.product_type_id = product_detail.product_type_id;
      }

      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: post.id },
        defaults: { ...dbProductDetail, post_id: post.id },
      });

      if (!created) {
        await detail.update(dbProductDetail);
      }
    }

    res.json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
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


// controllers/postController.js
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Post.findAll({
      where: {
        type: 'testimonial',
        status: 'published'
      },
      order: [['created_at', 'DESC']],
      include: [
        { model: PostMeta, as: 'meta' },
        { model: Category, as: 'categories', through: { attributes: [] } }
      ]
    });

    res.json({ data: testimonials, total: testimonials.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch testimonials' });
  }
}

exports.getBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      where: { slug, status: 'published' },
      include: [
        { model: PostMeta, as: 'meta' },
        {
          model: PostCategory,
          as: 'post_categories',
          include: [{ model: Category, as: 'category' }]
        },
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
        }
      ]
    });

    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
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

    const post = await Post.findOne({ where: { slug } });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const {
      website_id, user_id, title, slug: newSlug, content,
      excerpt, thumbnail_url, status, published_at,
      type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body;

    await post.update({
      website_id, user_id, title, slug: newSlug || slug, content, excerpt, thumbnail_url, status, published_at: status === 'published' ? (post.published_at || new Date()) : null, type, template, parent_id
    });

    await PostMeta.destroy({ where: { post_id: post.id } });
    if (meta.length > 0) {
      const metas = meta.map(m => ({
        post_id: post.id,
        meta_key: m.meta_key,
        meta_value: m.meta_value
      }));
      await PostMeta.bulkCreate(metas);
    }

    if (category_ids?.length > 0) {
      await post.setCategories(category_ids);
    }

    if (type === 'product') {
      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: post.id },
        defaults: { ...product_detail, post_id: post.id }
      });

      if (!created) {
        await detail.update(product_detail);
      }
    }

    res.json({ message: 'Post updated successfully', post });
  } catch (err) {
    console.error(err);
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

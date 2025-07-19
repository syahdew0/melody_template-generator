const { Op } = require('sequelize')
const { Post, PostMeta, Category, ProductDetail, PostCategory } = require('../models')

exports.index = (req, res) => {
  res.json({ message: 'Post Controller is working.' });
};

// CREATE
exports.create = async (req, res) => {
  try {
    const {
      website_id, user_id, title, slug, content,
      excerpt, thumbnail_url, status, published_at,
      type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body

    // SLUGIFY dulu sebelum create
    const slugify = (text) =>
      text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')

    const finalSlug = slug && slug !== '' ? slugify(slug) : slugify(title || 'untitled')

    // Buat post hanya sekali!
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
      parent_id
    })

    // Insert META
    if (meta.length > 0) {
      const metas = meta.map(m => ({
        post_id: post.id,
        meta_key: m.meta_key,
        meta_value: m.meta_value
      }))
      await PostMeta.bulkCreate(metas)
    }

    // Insert CATEGORY
    if (category_ids?.length > 0) {
      const data = category_ids.map(category_id => ({
        post_id: post.id,
        category_id
      }))
      await PostCategory.bulkCreate(data)
    }

    // Insert PRODUCT DETAIL
    if (type === 'product' && product_detail) {
      await ProductDetail.create({
        ...product_detail,
        post_id: post.id
      })
    }

    // Kirim response
    res.status(201).json(post)
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: err.message })
  }
}

// GET ALL 
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || '';
    const type = req.query.type || null;
    const status = req.query.status || null;
    const id = req.query.id || null;
    const slug = req.query.slug || null; // ✅ Tambahan untuk filter by slug
    const categoryFilter = req.query.category;

    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (id) where.id = id;
    if (slug) where.slug = slug; // ✅ Tambahkan ke kondisi where
    if (search) where.title = { [Op.like]: `%${search}%` };

    const include = [
      { model: PostMeta, as: 'meta' },
      {
        model: PostCategory,
        as: 'post_categories',
        include: [{ model: Category, as: 'category' }],
        required: false // akan diubah ke true jika ada filter kategori
      },
      { model: ProductDetail, as: 'product_detail' }
    ];

    // Filter kategori jika ada
    if (categoryFilter) {
      const categoryIds = Array.isArray(categoryFilter)
        ? categoryFilter.map(id => parseInt(id))
        : [parseInt(categoryFilter)];

      include[1].required = true;
      include[1].where = {
        category_id: { [Op.in]: categoryIds }
      };
    }

    if (id) {
      const posts = await Post.findAll({
        where,
        include
      });

      return res.json({
        data: posts,
        total: posts.length
      });
    }

    // Default paginasi
    const { count, rows } = await Post.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include,
      distinct: true
    });

    return res.json({
      data: rows,
      total: count
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const post = await Post.findOne({
  where: {
    id: req.params.id,
    type: 'post',          
    status: 'published'     
  },
  include: [
    { model: PostMeta, as: 'meta' },
    {
      model: PostCategory,
      as: 'post_categories',
      include: [
        { model: Category, as: 'category' }
      ]
    },
    { model: ProductDetail, as: 'product_detail' }
  ]
});


    if (!post) return res.status(404).json({ message: 'Not found' })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// UPDATE
exports.update = async (req, res) => {
  try {
    const postId = req.params.id
    const {
      website_id, user_id, title, slug, content,
      excerpt, thumbnail_url, status, published_at,
      type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body

    const post = await Post.findByPk(postId)
    if (!post) return res.status(404).json({ message: 'Post not found' })

    await post.update({
      website_id,
      user_id,
      title,
      slug,
      content,
      excerpt,
      thumbnail_url,
      status,
      published_at: status === 'published' ? (post.published_at || new Date()) : null,
      type,
      template,
      parent_id
    })

    await PostMeta.destroy({ where: { post_id: postId } })
    if (meta.length > 0) {
      const metas = meta.map(m => ({
        post_id: postId,
        meta_key: m.meta_key,
        meta_value: m.meta_value
      }))
      await PostMeta.bulkCreate(metas)
    }

    if (category_ids?.length > 0) {
      await post.setCategories(category_ids)
    }

    if (type === 'product') {
      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: postId },
        defaults: { ...product_detail, post_id: postId }
      })

      if (!created) {
        await detail.update(product_detail)
      }
    }

    res.json({ message: 'Post updated successfully', post })
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE
exports.remove = async (req, res) => {
  try {
    const id = req.params.id
    await PostMeta.destroy({ where: { post_id: id } })
    await ProductDetail.destroy({ where: { post_id: id } }) 
    await Post.destroy({ where: { id } })
    res.json({ message: 'Deleted successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// controllers/postController.js
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Post.findAll({
      where: {
        type: 'testimonial',
        status: 'published'
      },
      order: [['createdAt', 'DESC']],
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
  const { slug } = req.params;

  // Tentukan type berdasarkan route yang digunakan
  let type = 'post'; // default
  if (req.originalUrl.includes('/page/')) type = 'page';
  if (req.originalUrl.includes('/post/')) type = 'post';

  try {
    const post = await Post.findOne({
      where: {
        slug,
        type,
        status: {
          [Op.in]: ['published', 'draft']
        }
      },
      include: [
        { model: PostMeta, as: 'meta' },
        {
          model: PostCategory,
          as: 'post_categories',
          include: [{ model: Category, as: 'category' }]
        },
        { model: ProductDetail, as: 'product_detail' }
      ]
    });

    if (!post) return res.status(404).json({ message: `${type} not found` });
    res.json(post);
  } catch (err) {
    console.error('Error in getBySlug:', err);
    res.status(500).json({ message: err.message });
  }
}


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

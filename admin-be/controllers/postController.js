const { Op } = require('sequelize')
const { Post, PostMeta, Category, ProductDetail, PostCategory } = require('../models')

// CREATE
exports.create = async (req, res) => {
  try {
    const {
      website_id, user_id, title, slug, content,
      excerpt, thumbnail_url, status, published_at,
      type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body

    const post = await Post.create({
      website_id,
      user_id,
      title,
      slug,
      content,
      excerpt,
      thumbnail_url,
      status,
      published_at: status === 'published' ? new Date() : null,
      type,
      template,
      parent_id
    })

    if (meta.length > 0) {
      const metas = meta.map(m => ({
        post_id: post.id,
        meta_key: m.meta_key,
        meta_value: m.meta_value
      }))
      await PostMeta.bulkCreate(metas)
    }

    if (category_ids?.length > 0) {
      // await post.setCategories(category_ids)
      const data = category_ids.map(m => ({
        post_id: post.id,
        category_id: m
      }))
      await PostCategory.bulkCreate(data)
    }

    if (type === 'product' && product_detail) {
      await ProductDetail.create({
        ...product_detail,
        post_id: post.id
      })
    }

    res.status(201).json(post)
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message })
  }
}

// GET ALL 
exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit
    const search = req.query.search || ''
    const type = req.query.type || null
    const status = req.query.status || null
    const id = req.query.id || null

    const where = {}
    if (type) where.type = type
    if (status) where.status = status
    if (id) where.id = id
    if (search) where.title = { [Op.like]: `%${search}%` }

    // Jika ada ID, ambil langsung tanpa paginasi
    if (id) {
      const posts = await Post.findAll({
        where,
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
      })

      return res.json({
        data: posts,
        total: posts.length
      })
    }

    // Jika tidak ada ID, pakai paginasi biasa
    const { count, rows } = await Post.findAndCountAll({
      where,
      offset,
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        { model: PostMeta, as: 'meta' },
        // { model: Category, as: 'categories', through: { attributes: [] } },
        {
          model: PostCategory,
          as: 'post_categories',
          include: [
            { model: Category, as: 'category' }
          ]
        },
        { model: ProductDetail, as: 'product_detail' }
      ]
    })

    res.json({
      data: rows,
      total: count
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: PostMeta, as: 'meta' },
        // { model: Category, as: 'categories', through: { attributes: [] } },
        {
          model: PostCategory,
          as: 'post_categories',
          include: [
            { model: Category, as: 'category' }
          ]
        },
        { model: ProductDetail, as: 'product_detail' }
      ]
    })

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
    await ProductDetail.destroy({ where: { post_id: id } }) // ✅ Hapus juga detail produk
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


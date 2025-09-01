const { Post, PostMeta, Category, ProductDetail, PostCategory } = require('../models')
const { Op } = require('sequelize')
const cron = require('node-cron');

exports.index = async (req, res) => {
  try {
    const posts = await Post.findAll({
       where: { status: 'published' }, 
      include: [
        { model: ProductDetail, as: 'product_detail' },
        { model: Category, as: 'categories' }
      ]
    });

   const data = posts.map(post => {
  let final_price = null;
  let original_price = null;

  if (post.product_detail) {
    const { price, discount_price, discount_until } = post.product_detail;

    // harga asli
    original_price = price;

    // default harga final = price
    final_price = price;

    // jika ada diskon dan masih berlaku
    if (discount_price && discount_until && new Date(discount_until) > new Date()) {
      final_price = discount_price;
    }
  }

  return {
    ...post.toJSON(),
    product_detail: {
      ...post.product_detail?.toJSON(),
      original_price, // harga asli (buat dicoret)
      final_price     // harga final (warna merah)
    }
  };
});

res.json(data);


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
      website_id, user_id, title, slug, content,
      excerpt, thumbnail_url, status, published_at,
      type, template, parent_id,
      meta = [], product_detail = {}, category_ids = []
    } = req.body

    // Fungsi slugify sederhana
    const slugify = (text) =>
      text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-')

    // Buat slug awal
    let baseSlug = slug && slug !== '' ? slugify(slug) : slugify(title || 'untitled')
    let finalSlug = baseSlug
    let counter = 1

    // Loop cek slug unik di DB
    while (await Post.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Buat post
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
        post_id: post.id,
        created_at: new Date(),
        updated_at: new Date(),
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
    const slug = req.query.slug || null
    const type = req.query.type || null

    const where = { status: { [Op.in]: ['published'] } }
    if (type) where.type = type
    if (slug) where.slug = slug

  // Jika hanya cari 1 data by slug
if (slug) {
  const page = await Post.findOne({
    where,
    include: [
      { model: PostMeta, as: 'meta' },
      {
        model: PostCategory,
        as: 'post_categories',
        include: [{ model: Category, as: 'category' }]
      },
      { model: ProductDetail, as: 'product_detail' }
    ]
  })

  if (!page) return res.status(404).json({ message: 'post not found' })
  return res.json({ data: [page], total: 1 })
}


    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const include = [
      { model: PostMeta, as: 'meta' },
      {
        model: PostCategory,
        as: 'post_categories',
        include: [{ model: Category, as: 'category' }],
        required: false
      },
      { model: ProductDetail, as: 'product_detail' }
    ]

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      offset,
      limit,
      distinct: true,
      order: [['created_at', 'DESC']]
    })

    let filtered = rows

    // Hanya filter post/blog kalau type bukan "product"
    if (!type || type === 'post') {
      filtered = rows.filter(p =>
        p.type === 'post' ||
        p.post_categories?.some(pc =>
          ['post', 'blog'].includes(pc.category?.slug)
        )
      )
    }

    res.json({ data: filtered, total: filtered.length })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
}

// GET BY ID
exports.getById = async (req, res) => {
  try {
const post = await Post.findOne({
  where: {
    id: req.params.id,
    type: 'product' 
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
    website_id,user_id,title, slug, content: content ?? post.content, excerpt, thumbnail_url, status, published_at: status === 'published' ? (post.published_at || new Date()) : null, type, template, parent_id
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
    where: { post_id: post.id },
    defaults: { ...product_detail, post_id: post.id }
  });

  if (!created) {
    await detail.update(product_detail);
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
  const { slug } = req.params;

  // Tentukan type berdasarkan route yang digunakan
  let type = 'post'; // default
  if (req.originalUrl.includes('/page/')) type = 'page';
  if (req.originalUrl.includes('/post/')) type = 'post';
  if (req.originalUrl.includes('/product')) type = 'product';

  try {
    const post = await Post.findOne({
      where: {
        slug,
        type,
        status: {
          [Op.in]: ['published',]
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
    const { slug } = req.params

    // Cari kategori berdasarkan slug
    const category = await Category.findOne({ where: { slug } })
    if (!category) {
      return res.status(404).json({ message: 'Kategori tidak ditemukan' })
    }

    // Ambil semua postingan berdasarkan category_id
    const posts = await Post.findAll({
       where: { category_id: category.id, status: 'published' },
      order: [['created_at', 'DESC']],
    })

    return res.json({ category, posts })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Gagal mengambil postingan' })
  }
}


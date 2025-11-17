const { Post, PostMeta, Category, ProductDetail, PostCategory, ProductType,  ProductVariant, ProductVariantValue, ProductVariantOption, Brand,  Listing, ListingValue, ListingTyp } = require('../models')
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
      },
      { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'image'] } 
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

// exports.getTypes = (req, res) => {
//  const typeMap = { post: 1, page: 2, product: 3, testimonial: 4, custom_page: 5 };
// const type_id = req.body.type_id || typeMap[type] || null;
//   res.json(types)
// }
exports.getTypes = (req, res) => {
  const types = ['post', 'page', 'product', 'testimonial', 'custom_page'];
  res.json(types);
}

exports.create = async (req, res) => {
  try {
    const {
      website_id, user_id, title, slug, content, excerpt,
      thumbnail_url, other_images = [], status, type, template, parent_id, author_name, author_position,
      meta = [], product_detail = {}, variations = [],
      additional_kolom1,
      additional_kolom2,
      additional_kolom3,
      additional_kolom4,
      additional_kolom5
    } = req.body;

    const {
      listing_type,
      price,
      kondisi,
      latitude,
      longitude,
      provinsi,
      kabupaten,
      kecamatan,
      kelurahan,
      listing_values = [],
    } = req.body;

      // LISTING VALUES
    let fixed_listing_values = Array.isArray(listing_values) ? listing_values : [];
    
    // Buat slug unik
    const slugify = (text) => text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-');
    let baseSlug = slug && slug !== '' ? slugify(slug) : slugify(title || 'untitled');
    let finalSlug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const typeMap = { post: 1, page: 2, product: 3, testimonial: 4, custom_page: 5 };
    const type_id = typeMap[type] || null;
    // const product_type_id = type_id; // untuk product_detail

    // CREATE POST
    const post = await Post.create({
      website_id,
      user_id,
      title,
      slug: finalSlug,
      content,
      excerpt,
      thumbnail_url,
      other_images,
      status,
      published_at: status === 'published' ? new Date() : null,
      type,
      type_id,
      template,
      parent_id,
      author_name,
      author_position,
      additional_kolom1,
      additional_kolom2,
      additional_kolom3,
      additional_kolom4,
      additional_kolom5
    });

if (listing_type || (Array.isArray(listing_values) && listing_values.length > 0)) {
  await Listing.create({
    post_id: post.id,
    listing_type,
    price,
    kondisi,
    latitude,
    longitude,
    provinsi,
    kabupaten,
    kecamatan,
    kelurahan
  })

  if (Array.isArray(fixed_listing_values) && fixed_listing_values.length > 0) {
    const values = fixed_listing_values.map(v => ({
      post_id: post.id,
      tag_name: v.tag_name,
      language_id: v.language_id || 1,
      value: v.value
    }));
    
    await ListingValue.bulkCreate(values);
  }
}
    
    // META
    if (meta.length > 0) {
      const metas = meta.map(m => ({ post_id: post.id, meta_key: m.meta_key, meta_value: m.meta_value }));
      await PostMeta.bulkCreate(metas);
    }

    // PRODUCT DETAIL + VARIANTS
    if (type === 'product') {
      const detail = await ProductDetail.create({ ...product_detail, post_id: post.id,  });

      if (Array.isArray(variations) && variations.length) {
        for (const v of variations) {
          const variant = await ProductVariant.create({
            product_id: post.id,
            combination: v.values.map(i => `${i.option}:${i.value}`).join(','),
            sku: v.sku || null,
            price: Number(v.price || 0),
            stock: Number(v.stock || 0),
            image: v.image || null
          });

          for (const val of v.values) {
            let option = await ProductVariantOption.findOne({ where: { product_id: post.id, name: val.option } });
            if (!option) option = await ProductVariantOption.create({ product_id: post.id, name: val.option });

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
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [
            {
              model: ProductVariant,
              as: 'variations',
              include: [{ model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }]
            }
          ]
        }
      ]
    });

    const formatVariants = (variants) => variants.map(v => ({
      id: v.id,
      combination: v.combination,
      sku: v.sku,
      price: Number(v.price),
      stock: Number(v.stock),
      image: v.image,
      values: (v.values || []).map(val => ({ value: val.value, option: val.option?.name || val.option }))
    }));

    const postJSON = createdPost.toJSON();
    if (postJSON.product_detail?.variations) postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);

    res.status(201).json({ message: 'Post created successfully', data: postJSON });

  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const postId = req.params.id;
      // const postId = req.params.post_id;

    const {
      website_id, user_id, title, slug, content, excerpt,
      thumbnail_url, other_images = [], status, type, template, parent_id,
      author_name, author_position, meta = [], category_ids = [],
      additional_kolom1, additional_kolom2, additional_kolom3,
      additional_kolom4, additional_kolom5,

      // Listing
      listing_type, price, kondisi, latitude, longitude,
      provinsi, kabupaten, kecamatan, kelurahan,
      listing_values = [],

      // Product
      product_detail = {}
    } = req.body;

    const variations = product_detail?.variations || [];

    const typeMap = {
      post: 1,
      page: 2,
      product: 3,
      testimonial: 4,
      custom_page: 5
    };
    const type_id = typeMap[type] || null;

    const post = await Post.findByPk(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // =========================
    // UPDATE POST
    // =========================
    await post.update({
      website_id,
      user_id,
      title,
      slug: slug || post.slug,
      content: content ?? post.content,
      excerpt,
      thumbnail_url,
      other_images,
      status,
      published_at: status === 'published'
        ? (post.published_at || new Date())
        : null,
      type,
      type_id,
      template,
      parent_id,
      author_name,
      author_position,
      additional_kolom1,
      additional_kolom2,
      additional_kolom3,
      additional_kolom4,
      additional_kolom5
    });

    // =========================
    // UPDATE LISTING
    // =========================
    let listing = await Listing.findOne({ where: { post_id: postId } });

    if (listing) {
      await listing.update({
        listing_type,
        price,
        kondisi,
        latitude,
        longitude,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan
      });
    } else {
      listing = await Listing.create({
        post_id: postId,
        listing_type,
        price,
        kondisi,
        latitude,
        longitude,
        provinsi,
        kabupaten,
        kecamatan,
        kelurahan
      });
    }

    // Listing Values → Replace All
    await ListingValue.destroy({ where: { post_id: postId } });

    if (Array.isArray(listing_values) && listing_values.length > 0) {
      const values = listing_values.map(v => ({
        post_id: postId,
        tag_name: v.tag_name,
        language_id: v.language_id || 1,
        value: v.value
      }));

      await ListingValue.bulkCreate(values);
    }

    // =========================
    // UPDATE META
    // =========================
    await PostMeta.destroy({ where: { post_id: postId } });

    if (meta.length > 0) {
      const metas = meta.map(m => ({
        post_id: postId,
        meta_key: m.meta_key,
        meta_value: m.meta_value
      }));
      await PostMeta.bulkCreate(metas);
    }

    // =========================
    // UPDATE CATEGORY (OPSIONAL)
    // =========================
    if (category_ids?.length > 0) {
      await post.setCategories(category_ids);
    }

    // =========================
    // PRODUCT DETAIL + VARIANTS
    // =========================
    if (type === 'product') {
      const [detail, created] = await ProductDetail.findOrCreate({
        where: { post_id: post.id },
        defaults: { ...product_detail, post_id: post.id }
      });

      if (!created) await detail.update(product_detail);

      // UPDATE / CREATE VARIATIONS
      if (Array.isArray(variations) && variations.length) {
        for (const v of variations) {
          let variant;

          if (v.id) {
            variant = await ProductVariant.findByPk(v.id);
            if (variant) {
              await variant.update({
                combination: v.values.map(i => `${i.option}:${i.value}`).join(','),
                sku: v.sku || null,
                price: Number(v.price || 0),
                stock: Number(v.stock || 0),
                image: v.image || null
              });
            }
          }

          if (!variant) {
            variant = await ProductVariant.create({
              product_id: post.id,
              combination: v.values.map(i => `${i.option}:${i.value}`).join(','),
              sku: v.sku || null,
              price: Number(v.price || 0),
              stock: Number(v.stock || 0),
              image: v.image || null
            });
          }

          // VALUES
          for (const val of v.values) {
            let option = await ProductVariantOption.findOne({
              where: { product_id: post.id, name: val.option }
            });

            if (!option) {
              option = await ProductVariantOption.create({
                product_id: post.id,
                name: val.option
              });
            }

            if (val.id) {
              const variantValue = await ProductVariantValue.findByPk(val.id);
              if (variantValue) {
                await variantValue.update({
                  value: val.value,
                  option_id: option.id
                });
                continue;
              }
            }

            // Create value baru
            await ProductVariantValue.create({
              variant_id: variant.id,
              option_id: option.id,
              value: val.value
            });
          }
        }
      }
    }

    // =========================
    // FETCH FINAL RESULT
    // =========================
    const updatedPost = await Post.findOne({
      where: { id: post.id },
      include: [
        { model: PostMeta, as: 'meta' },
        {
          model: ProductDetail,
          as: 'product_detail',
          include: [{
            model: ProductVariant,
            as: 'variations',
            include: [{
              model: ProductVariantValue,
              as: 'values',
              include: [{ model: ProductVariantOption, as: 'option' }]
            }]
          }]
        }
      ]
    });

    const formatVariants = (variants) =>
      variants.map(v => ({
        id: v.id,
        combination: v.combination,
        sku: v.sku,
        price: Number(v.price),
        stock: Number(v.stock),
        image: v.image,
        values: (v.values || []).map(val => ({
          value: val.value,
          option: val.option?.name || val.option
        }))
      }));

    const postJSON = updatedPost.toJSON();
    if (postJSON.product_detail?.variations) {
      postJSON.product_detail.variations =
        formatVariants(postJSON.product_detail.variations);
    }

    res.json({
      message: 'Post updated successfully',
      data: postJSON
    });

  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({
      message: 'Error updating post',
      error: err.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { type, slug, search, brand, category, page = 1, limit = 'all', discount } = req.query;

    const where = { status: { [Op.in]: ['published', 'draft'] } };
    if (type) where.type = type;
    if (slug) where.slug = slug;

    const include = [{ model: PostMeta, as: 'meta' }];

    const categoryParam = category ? category.toLowerCase() : '';

    if (categoryParam && categoryParam !== 'all' && categoryParam !== 'all product') {
      include.push({
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug', 'display_in', 'parent_id'],
        where: { slug: { [Op.in]: category.split(',').map(s => s.toLowerCase()) } },
        through: { attributes: [] },
        required: true
      });
    } else {
      include.push({
        model: Category,
        as: 'categories',
        attributes: ['id', 'name', 'slug', 'display_in', 'parent_id'],
        through: { attributes: [] },
        required: false
      });
    }

    // Product detail include (brand, variant, discount)
    if (!type || type === 'product') {
      const productDetailInclude = {
        model: ProductDetail,
        as: 'product_detail',
        required: !!brand || discount === 'true',
        where: {},
        include: [
          {
            model: Brand,
            as: 'brand',
            attributes: ['id', 'name', 'slug', 'image'],
            where: brand ? { slug: { [Op.in]: brand.split(',').map(b => b.toLowerCase()) } } : undefined,
            required: !!brand
          },
          {
            model: ProductVariant,
            as: 'variations',
            include: [
              { model: ProductVariantValue, as: 'values', include: [{ model: ProductVariantOption, as: 'option' }] }
            ]
          }
        ]
      };

      if (discount === 'true') {
        productDetailInclude.where.isDiscountActive = true;
        productDetailInclude.where.discount_until = { [Op.gt]: new Date() };
      }

      include.push(productDetailInclude);
    }

    // Search
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { slug: { [Op.like]: `%${search}%` } }
      ];
    }

    // Jika slug spesifik
    if (slug) {
      const post = await Post.findOne({ where, include });
      if (!post) return res.status(404).json({ message: 'Post not found' });

      const postJSON = post.toJSON();
      if (postJSON.product_detail?.variations) {
        postJSON.product_detail.variations = formatVariants(postJSON.product_detail.variations);
      }

      return res.json({ data: [postJSON], total: 1 });
    }

    // Tentukan offset & limit
    const usePagination = limit !== 'all';
    const offset = usePagination ? (page - 1) * limit : null;
    const finalLimit = usePagination ? parseInt(limit) : null;

    const { count, rows } = await Post.findAndCountAll({
      where,
      include,
      offset,
      limit: finalLimit,
      distinct: true,
      order: [['created_at', 'DESC']]
    });

    const data = rows.map(post => {
      const p = post.toJSON();
      if (p.product_detail?.variations) p.product_detail.variations = formatVariants(p.product_detail.variations);
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
     where: { 
        id,
        status: { [Op.in]: ['published', 'draft'] }
      },
      include: [
  { model: PostMeta, as: 'meta' },
  { model: PostCategory, as: 'post_categories', include: [{ model: Category, as: 'category' }] },
  {
    model: ProductDetail,
    as: 'product_detail',
    include: [
      { model: ProductType, as: 'product_type', attributes: ['id','name','parent_id'] },
      { model: Brand, as: 'brand', attributes: ['id', 'name', 'slug', 'image'] },
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
      where: { 
        slug,
        status: { [Op.in]: ['published', 'draft'] } 
      },
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
      excerpt, thumbnail_url, other_images = [], status, type, template, parent_id,author_name, author_position,
      meta = [], product_detail = {}, category_ids = [], variations = []
    } = req.body;
        const typeMap = {
        post: 1,
        page: 2,
        product: 3,
        testimonial: 4,
        custom_page: 5
      };

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
      other_images,
      status,
      published_at: status === 'published' ? (post.published_at || new Date()) : null,
      type,
      type_id,
      template,
      parent_id,
      author_name,
      author_position
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
      if (!created) await detail.update(product_detail,);

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
  where: { 
    status: { [Op.in]: ['published', 'draft'] } 
  },
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
        { model: ProductType, as: 'product_type', attributes: ['id','name'] },
        { model: Brand, as: 'brand', attributes: ['id','name','slug','image'] }
      ]
    },
    { model: PostMeta, as: 'meta' }
  ],
  order: [['created_at', 'DESC']]
});


    return res.json({ category, posts });
  } catch (error) {
    console.error('Error getPostsByCategory:', error);
    res.status(500).json({ message: 'Gagal mengambil postingan' });
  }
};

// ======================= TESTIMONIAL =======================

// Get all published testimonials
exports.getTestimonials = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Post.findAndCountAll({
      where: { type: 'testimonial', status: 'published' },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      data: rows.map(r => ({
        id: r.id,
        title: r.title,
        content: r.content,
        author_name: r.author_name,
        author_position: r.author_position,
        image: r.thumbnail_url,
        created_at: r.created_at
      }))
    });
  } catch (err) {
    console.error('Error getTestimonials:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get testimonial detail by slug
exports.getTestimonialBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const testimonial = await Post.findOne({
      where: { slug, type: 'testimonial', status: 'published' }
    });

    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    res.json({
      id: testimonial.id,
      title: testimonial.title,
      content: testimonial.content,
      author_name: testimonial.author_name,
      author_position: testimonial.author_position,
      image: testimonial.thumbnail_url,
      created_at: testimonial.created_at
    });
  } catch (err) {
    console.error('Error getTestimonialBySlug:', err);
    res.status(500).json({ message: err.message });
  }
};

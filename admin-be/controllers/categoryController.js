const { Category, PostCategory, PostType } = require('../models');
const { Op } = require('sequelize');

exports.getAll = async (req, res) => {
  try {
    const { display_in, parent_id } = req.query;
    const where = {};

    if (parent_id) where.parent_id = parent_id;
    if (display_in) where.display_in = display_in; // filter by ID sekarang

    const categories = await Category.findAll({
      where,
      include: [
        { model: Category, as: 'children' }, // untuk subkategori
        {
          model: PostType,
          as: 'post_type', // tetap include PostType jika mau data lengkap
          attributes: ['id', 'name'],
          required: false
        }
      ],
      order: [['name', 'ASC']],
    });

    // Map supaya display_in = ID PostType (langsung field display_in)
    const result = categories.map(cat => cat.toJSON());

    res.json(result);
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' },
        { model: PostType, as: 'post_type', attributes: ['id', 'name'], required: false }
      ]
    });

    if (!category) return res.status(404).json({ message: 'Not found' });

    const result = category.toJSON();
    // display_in tetap ID (tidak diubah ke nama)
    // result.display_in = result.display_in;

    res.json(result);
  } catch (err) {
    console.error('Error fetching category by ID:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


// CREATE
exports.create = async (req, res) => {
  try {
    const { name, slug, description, website_id, parent_id, display_in } = req.body;

    let displayInId = null;

    if (display_in) {
      const type = await PostType.findOne({ where: { name: display_in } });
      if (!type) {
        return res.status(400).json({ message: `PostType '${display_in}' not found` });
      }
      displayInId = type.id;
    }

    const category = await Category.create({
      name,
      slug,
      description,
      website_id,
      parent_id: parent_id || null,
      display_in: displayInId, // gunakan ID, bukan string
    });

    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({ message: err.message });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, slug, description, website_id, parent_id, display_in } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Not found' });

    await category.update({
      name,
      slug,
      description,
      website_id,
      parent_id: parent_id || null,
      display_in,
    });

    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE (validasi relasi)
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    const relatedPosts = await PostCategory.count({ where: { category_id: id } });
    if (relatedPosts > 0) {
      return res.status(400).json({
        message: 'Tidak bisa menghapus kategori karena masih digunakan oleh post.',
      });
    }

    const childCount = await Category.count({ where: { parent_id: id } });
    if (childCount > 0) {
      return res.status(400).json({
        message: 'Tidak bisa menghapus kategori yang memiliki subkategori.',
      });
    }

    const deleted = await Category.destroy({ where: { id } });
    if (deleted === 0) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET by parent
exports.getByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const categories = await Category.findAll({ where: { parent_id: parentId } });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

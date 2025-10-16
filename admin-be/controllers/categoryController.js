const { Category, PostCategory, PostType } = require('../models');
const { Op, literal } = require('sequelize');

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const { display_in, parent_id } = req.query;
    const where = {};

    if (display_in) where.display_in = display_in;

    if (parent_id) {
      // Filter dengan primary parent OR parent_ids JSON
      where[Op.or] = [
        { parent_id: parent_id },
        literal(`JSON_CONTAINS(parent_ids, '${parent_id}')`)
      ];
    }

    const categories = await Category.findAll({
      where,
      include: [
        { model: Category, as: 'children' }, 
        { model: PostType, as: 'post_type', attributes: ['id', 'name'], required: false }
      ],
      order: [['name', 'ASC']]
    });

    res.json(categories.map(cat => cat.toJSON()));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET BY ID
exports.getById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [
        { model: Category, as: 'parent' },
        { model: Category, as: 'children' },
        { model: PostType, as: 'post_type', attributes: ['id', 'name'], required: false }
      ]
    });

    if (!category) return res.status(404).json({ message: 'Category not found' });
    res.json(category.toJSON());
  } catch (err) {
    console.error('Error fetching category by ID:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// CREATE CATEGORY
exports.create = async (req, res) => {
  try {
    const { name, slug, description, website_id, parent_id, parent_ids, display_in } = req.body;

    let displayInId = null;
    if (display_in) {
      if (!isNaN(display_in)) {
        const type = await PostType.findByPk(display_in);
        if (!type) return res.status(400).json({ message: `PostType ID '${display_in}' not found` });
        displayInId = type.id;
      } else {
        const type = await PostType.findOne({ where: { name: display_in } });
        if (!type) return res.status(400).json({ message: `PostType '${display_in}' not found` });
        displayInId = type.id;
      }
    }

const category = await Category.create({
  name,
  slug,
  description,
  website_id,
  parent_id: parent_id || null,
  parent_ids: parent_ids || (parent_id ? [parent_id] : null),
  display_in: displayInId
});

    res.status(201).json(category);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(400).json({ message: err.message });
  }
};

// UPDATE CATEGORY
exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, slug, description, website_id, parent_id, parent_ids, display_in } = req.body;

    const category = await Category.findByPk(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    let displayInId = null;
    if (display_in) {
      if (!isNaN(display_in)) {
        const type = await PostType.findByPk(display_in);
        if (!type) return res.status(400).json({ message: `PostType ID '${display_in}' not found` });
        displayInId = type.id;
      } else {
        const type = await PostType.findOne({ where: { name: display_in } });
        if (!type) return res.status(400).json({ message: `PostType '${display_in}' not found` });
        displayInId = type.id;
      }
    }

    await category.update({
      name,
      slug,
      description,
      website_id,
      parent_id: parent_id || null,
      parent_ids: parent_ids || (parent_id ? [parent_id] : null),
      display_in: displayInId
    });

    res.json(category);
  } catch (err) {
    console.error('Error updating category:', err);
    res.status(400).json({ message: err.message });
  }
};

// DELETE CATEGORY
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    const relatedPosts = await PostCategory.count({ where: { category_id: id } });
    if (relatedPosts > 0) {
      return res.status(400).json({ message: 'Tidak bisa menghapus kategori karena masih digunakan oleh post.' });
    }

    const childCount = await Category.count({ 
      where: { 
        [Op.or]: [
          { parent_id: id },
          literal(`JSON_CONTAINS(parent_ids, '${id}')`)
        ]
      }
    });
    if (childCount > 0) {
      return res.status(400).json({ message: 'Tidak bisa menghapus kategori yang memiliki subkategori.' });
    }

    const deleted = await Category.destroy({ where: { id } });
    if (!deleted) return res.status(404).json({ message: 'Category not found' });

    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Error deleting category:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// GET BY PARENT
exports.getByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const categories = await Category.findAll({
      where: {
        [Op.or]: [
          { parent_id: parentId },
          literal(`JSON_CONTAINS(parent_ids, '${parentId}')`)
        ]
      }
    });
    res.json(categories);
  } catch (err) {
    console.error('Error fetching subcategories:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

const { Category } = require('../models')

// GET all
exports.getAll = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// GET by ID
exports.getById = async (req, res) => {
  const category = await Category.findByPk(req.params.id)
  if (!category) return res.status(404).json({ message: 'Not found' })
  res.json(category)
}

// CREATE
exports.create = async (req, res) => {
  try {
    const category = await Category.create(req.body)
    res.status(201).json(category)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// UPDATE
exports.update = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id)
    if (!category) return res.status(404).json({ message: 'Not found' })
    await category.update(req.body)
    res.json(category)
  } catch (err) {
    res.status(400).json({ message: err.message })
  }
}

// DELETE
exports.remove = async (req, res) => {
  try {
    const id = req.params.id;

    // Cek relasi ke post_categories
    const related = await PostCategory.count({
      where: { category_id: id }
    })

    if (related > 0) {
      return res.status(400).json({
        message: 'Tidak bisa menghapus kategori karena masih digunakan oleh post.'
      })
    }

    const deleted = await Category.destroy({ where: { id } })
    if (deleted === 0) {
      return res.status(404).json({ message: 'Category not found' })
    }

    res.json({ message: 'Deleted' })
  } catch (err) {
    console.error('Error deleting category:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
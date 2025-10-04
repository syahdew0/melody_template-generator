const { ProductType } = require('../models');

// Helper: build nested tree (opsional, kalau mau kirim flat + children)
const buildTree = (items, parentId = null) => {
  return items
    .filter(i => i.parent_id === parentId)
    .map(i => ({
      ...i.toJSON(),
      children: buildTree(items, i.id)
    }))
}

// GET all product types (nested)
const getAll = async (req, res) => {
  try {
    const productTypes = await ProductType.findAll({
      order: [['id', 'ASC']],
      include: [
        { model: ProductType, as: 'children', order: [['id', 'ASC']] } // eager load children
      ]
    });

    // Bisa juga pakai tree helper
    const tree = buildTree(productTypes);

    return res.json({
      status: 'success',
      message: 'Product types retrieved successfully',
      data: tree
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve product types.' });
  }
};

// GET product type by ID (include children & parent)
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByPk(id, {
      include: [
        { model: ProductType, as: 'children' },
        { model: ProductType, as: 'parent' }
      ]
    });

    if (!productType) {
      return res.status(404).json({ status: 'error', message: 'Product type not found.' });
    }

    return res.json({
      status: 'success',
      message: 'Product type retrieved successfully',
      data: productType
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve product type.' });
  }
};

// CREATE new product type
const create = async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Name is required.' });
    }

    const existing = await ProductType.findOne({ where: { name } });
    if (existing) {
      return res.status(400).json({ status: 'error', message: 'Product type already exists.' });
    }

    const productType = await ProductType.create({ name, parent_id: parent_id || null });

    return res.status(201).json({
      status: 'success',
      message: 'Product type created successfully',
      data: productType
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to create product type.' });
  }
};

// UPDATE product type
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id } = req.body;

    const productType = await ProductType.findByPk(id);
    if (!productType) {
      return res.status(404).json({ status: 'error', message: 'Product type not found.' });
    }

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Name is required.' });
    }

    productType.name = name;
    productType.parent_id = parent_id || null;
    await productType.save();

    return res.json({
      status: 'success',
      message: 'Product type updated successfully',
      data: productType
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to update product type.' });
  }
};

// DELETE product type
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const productType = await ProductType.findByPk(id);

    if (!productType) {
      return res.status(404).json({ status: 'error', message: 'Product type not found.' });
    }

    // Optional: cek dulu apakah ada children
    const children = await ProductType.findAll({ where: { parent_id: id } });
    if (children.length) {
      return res.status(400).json({ status: 'error', message: 'Cannot delete: has nested child types.' });
    }

    await productType.destroy();

    return res.json({
      status: 'success',
      message: 'Product type deleted successfully'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete product type.' });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: remove
};

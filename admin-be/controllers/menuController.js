const { menu_group, menu_item } = require('../models');

exports.getMenuGroups = async (req, res) => {
  const data = await menu_group.findAll();
  res.json(data);
};

exports.assignType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const field = `is_${type}`; 

  try {
    await menu_group.update({ [field]: true }, { where: { id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Gagal assign type', error: err.message });
  }
};


exports.unassignType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const field = `is_${type}`;
  await menu_group.update({ [field]: false }, { where: { id } });
  res.json({ success: true });
};

exports.getMenuItemsByGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const items = await menu_item.findAll({ where: { menu_group_id: groupId } });
  // console.log('menu items:', items.map(i => ({ id: i.id, name: i.name, path: i.path })));
  res.json(items);
};

exports.getMenuItemsByQuery = async (req, res) => {
  const { groupId } = req.query;
  if (!groupId) return res.status(400).json({ message: 'groupId wajib diisi' });

  const items = await menu_item.findAll({
    where: { menu_group_id: groupId },
    order: [['parent_id', 'ASC'], ['id', 'ASC']],
  });

  res.json(items);
};

exports.createMenuItem = async (req, res) => {
  try {
    const item = await menu_item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan menu', error: error.message });
  }
};

exports.updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await menu_item.update(req.body, { where: { id } });
    const updated = await menu_item.findByPk(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah menu', error: error.message });
  }
}

exports.deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    await menu_item.destroy({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus menu', error: error.message });
  }
}

exports.getMenuGroupById = async (req, res) => {
  const { id } = req.params;
  try {
    const group = await menu_group.findByPk(id);
    if (!group) return res.status(404).json({ message: 'Menu group tidak ditemukan' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

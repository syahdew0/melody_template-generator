const { Menu } = require('../models');

exports.getNestedMenus = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      where: { parentId: null },
      order: [['order', 'ASC']],
      include: [
        {
          model: Menu,
          as: 'children',
          separate: true,
          order: [['order', 'ASC']]
        }
      ]
    });
    res.json(menus);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { name, path, parent_id } = req.body;
    const newMenu = await Menu.create({name,path, parentId: parent_id });
    res.status(201).json(newMenu);
  } catch (err) {
    res.status(500).json({ message: 'Error creating menu' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { name, path, parent_id } = req.body;
    const { id } = req.params;
    await Menu.update({name,path,parentId: parent_id }, { where: { id }});      
    res.json({ message: 'Menu updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating menu' });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;
    await Menu.destroy({ where: { id } });
    res.json({ message: 'Menu deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting menu' });
  }
};
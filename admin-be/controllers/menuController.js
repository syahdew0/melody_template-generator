const { menu_group, menu_item, menu_group: MenuGroup, menu_item: MenuItem } = require('../models');


// Get all menu groups
exports.getMenuGroups = async (req, res) => {
  try {
    const data = await menu_group.findAll();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data menu group', error: error.message });
  }
};

exports.assignType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const allowedTypes = ['main', 'footer', 'after_login'];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Type tidak valid' });
  }

  const field = `is_${type}`;

  try {
    await menu_group.update({ [field]: true }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Gagal assign type', error: error.message });
  }
};

// Unassign type (main, footer, after_login) from a menu group
exports.unassignType = async (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  const allowedTypes = ['main', 'footer', 'after_login'];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: 'Type tidak valid' });
  }

  const field = `is_${type}`;

  try {
    await menu_group.update({ [field]: false }, { where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Gagal unassign type', error: error.message });
  }
};

// Get menu items by menu group ID (via params)
exports.getMenuItemsByGroup = async (req, res) => {
  const { groupId } = req.params;

  try {
    const items = await menu_item.findAll({ where: { menu_group_id: groupId } });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil menu items', error: error.message });
  }
};

// Get menu items by query ?groupId=...
exports.getMenuItemsByQuery = async (req, res) => {
  const { groupId } = req.query;

  if (!groupId) {
    return res.status(400).json({ message: 'groupId wajib diisi' });
  }

  try {
    const items = await menu_item.findAll({
      where: { menu_group_id: groupId },
      order: [['parent_id', 'ASC'], ['id', 'ASC']],
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil menu items', error: error.message });
  }
};

// Create new menu item
exports.createMenuItem = async (req, res) => {
  try {
    const item = await menu_item.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Gagal menambahkan menu', error: error.message });
  }
};

// Update existing menu item
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    await menu_item.update(req.body, { where: { id } });
    const updated = await menu_item.findByPk(id);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengubah menu', error: error.message });
  }
};

exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;

  try {
    await menu_item.destroy({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus menu', error: error.message });
  }
};

// Get menu group by ID
exports.getMenuGroupById = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await menu_group.findByPk(id);
    if (!group) {
      return res.status(404).json({ message: 'Menu group tidak ditemukan' });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// this
// exports.getMenuBySlug = async (req, res) => {
//   const { group } = req.query;

//   if (!group) {
//     return res.status(400).json({ message: 'Parameter group diperlukan' });
//   }

//   try {
//     const groupData = await menu_group.findOne({
//       where: { slug: group, is_main: 1, is_footer: 0 },
//       include: [{
//         model: menu_item,
//         as: 'items',
//         required: false,
//       }],
//     });

//     if (!groupData) {
//       return res.status(404).json({ message: 'Grup menu tidak ditemukan' });
//     }

//     res.json(groupData.items);
//   } catch (error) {
//     res.status(500).json({ message: 'Gagal mengambil menu', error: error.message });
//   }
// };
exports.getMenuBySlug = async (req, res) => {
  const { group } = req.query;

  if (!group) {
    return res.status(400).json({ message: 'Parameter group diperlukan' });
  }
  
  if (group.toLowerCase() === 'footer') {
    return res.status(403).json({ message: 'Akses ke menu footer tidak diizinkan dari endpoint ini' });
  }

  try {
    const groupData = await menu_group.findOne({
      where: {
        slug: group,
        is_main: 1,
        is_footer: 0
      },
      include: [{
        model: menu_item,
        as: 'items',
        required: false,
      }],
    });

    if (!groupData) {
      return res.status(404).json({ message: 'Grup menu tidak ditemukan' });
    }

    res.json(groupData.items);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil menu', error: error.message });
  }
};


exports.getFooterMenus = async (req, res) => {
  try {

    // const groupData = await menu_group.findOne({
    //   where: { is_footer: 1, is_main_0 },
    //   include: [{
    //     model: menu_item,
    //     as: 'items',
    //     required: false,
    //   }],
    // });
    const footerGroups = await menu_group.findOne({
      where: {
        is_footer: 1, is_main: 0 
      },
      include: [{
        model: menu_item,
        as: 'items',
        required: false,
      }],
    });

    
    res.json(footerGroups);
  } catch (err) {
    console.error('Error fetching footer menus:', err);
    res.status(500).json({ message: 'Gagal mengambil menu footer' });
  }
};



// exports.getMenuList = async (req, res) => {
//   try {
//     const groupSlug = req.query.group;

//     const menuGroup = await MenuGroup.findOne({
//       where: { slug: groupSlug },
//       include: [
//         {
//           model: MenuItem,
//           as: 'items',
//           where: { is_active: true },
//           required: false
//         }
//       ],
//       order: [[{ model: MenuItem, as: 'items' }, 'order', 'ASC']] 
//     });

//     if (!menuGroup) {
//       return res.status(404).json({ message: 'Menu group not found' });
//     }

//     res.json(menuGroup.items);
//   } catch (error) {
//     console.error('Error fetching menu list:', error); // tambahkan log error
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };
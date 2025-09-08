const { User, Role, RoleActiveModule, Module } = require('../../models');

exports.getUserPermissions = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'Role',
          include: [
            {
              model: RoleActiveModule,
              as: 'activeModules',
              include: [{ model: Module, as: 'Module' }]
            }
          ]
        }
      ]
    });

    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

   const permissions = {};

user.Role.activeModules.forEach(ram => {
  if (!ram.Module) return; // skip jika Module null
  const moduleName = ram.Module.name;
  permissions[moduleName] = {
    canView: ram.canView,
    canAdd: ram.canAdd,
    canEdit: ram.canEdit,
    canDelete: ram.canDelete,
  };
});

    res.json(permissions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal ambil permissions' });
  }
};

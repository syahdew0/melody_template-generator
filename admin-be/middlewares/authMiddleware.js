const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    req.user = decoded;

    const newToken = jwt.sign(
      {
        UserId: decoded.UserId,
        RoleId: decoded.RoleId,
        OwnerId: decoded.OwnerId,
        role: decoded.role,
      },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '2h' }
    );
    res.setHeader('x-refreshed-token', newToken);

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};


exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Hanya admin yang dapat mengakses' })
  }
  next()
};

// exports.requirePermission = (permission) => {
//   return (req, res, next) => {
//     const userPermissions = req.user?.permissions || []; 
//     if (!userPermissions.includes(permission)) {
//       return res.status(403).json({ message: 'Tidak memiliki izin' });
//     }
//     next();
//   };
// };

exports.requireModulePermission = (moduleName, action) => {
  return async (req, res, next) => {
    const roleId = req.user.RoleId;
    const roleModule = await db.RoleActiveModule.findOne({
      where: { RoleId: roleId },
      include: [{ model: db.Module, as: 'Module', where: { name: moduleName } }]
    });

    if (!roleModule || !roleModule[action]) {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    next();
  };
};

exports.requireOtherModule = (moduleName) => {
  return async (req, res, next) => {
    const roleId = req.user.RoleId;
    const hasModule = await db.RoleOtherModule.findOne({
      where: { RoleId: roleId, ModuleName: moduleName }
    });

    if (!hasModule) {
      return res.status(403).json({ message: 'Tidak memiliki izin' });
    }

    next();
  };
};

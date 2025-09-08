const jwt = require('jsonwebtoken');
const { RoleActiveModule, RoleOtherModule, RoleCategory, Module } = require('../models');

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
    id: decoded.id,
    RoleId: decoded.RoleId,
    OwnerId: decoded.OwnerId,
    role: decoded.role,
    email: decoded.email
  },
  process.env.JWT_SECRET || "SECRET_KEY",
  { expiresIn: "2h" }
);
res.setHeader("x-refreshed-token", newToken);


    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};

exports.requireAdmin = (req, res, next) => {
  const role = (req.user?.role || "").toLowerCase();
  if (role !== "admin") {
    return res.status(403).json({ message: "Hanya admin yang dapat mengakses" });
  }
  next();
};

exports.requireModulePermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.RoleId;
      if (!roleId) return res.status(403).json({ message: "Role tidak ditemukan" });

      // Admin otomatis bisa akses
      if (req.user.role === 'Admin') return next();

      const roleModule = await RoleActiveModule.findOne({
        where: { RoleId: roleId },
        include: [
          {
            model: Module,
            as: "Module",
            where: { name: moduleName },
          },
        ],
      });

      if (!roleModule || !roleModule[action]) {
        return res.status(403).json({ message: "Tidak memiliki izin" });
      }

      next();
    } catch (err) {
      console.error("requireModulePermission error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};


// Middleware cek modul lainnya (other)
exports.requireOtherModule = (moduleName) => {
  return async (req, res, next) => {
    try {
      const roleId = req.user?.RoleId;
      if (!roleId) return res.status(403).json({ message: "Role tidak ditemukan" });

      const hasModule = await RoleOtherModule.findOne({
        where: {
          RoleId: roleId,
          ModuleName: moduleName, // nama modul atau permission spesifik
        },
      });

      if (!hasModule) {
        return res.status(403).json({ message: `Tidak memiliki izin untuk module: ${moduleName}` });
      }

      next();
    } catch (err) {
      console.error("requireOtherModule error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};

exports.requireCategoryAccess = (categoryIdParam = "categoryId") => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      const categoryId = req.params[categoryIdParam] || req.body[categoryIdParam];
      if (!categoryId) return res.status(400).json({ message: "Category ID dibutuhkan" });

      // Cek role blocked categories
      const rolecategory = await RoleCategory.findOne({
  where: {
    RoleId: user.RoleId,
    CategoryId: categoryId,
  },
});

// Kalau tidak ditemukan, berarti role **tidak punya akses** ke kategori
if (!rolecategory) {
  return res.status(403).json({ message: "Kategori ini diblokir untuk role Anda" });
}

next();

    } catch (err) {
      console.error("requireCategoryAccess error:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};

const db = require("../../models");
const Role = db.Role;
const RoleActiveModule = db.RoleActiveModule;
const RoleOtherModule = db.RoleOtherModule;
const Module = db.Module;
const BlockedCategory = db.RoleBlockedCategory;
const Category = db.Category;

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, activeModules, otherModules } = req.body;

    // Buat role utama
    const role = await Role.create({ name });

    // Simpan ke RoleActiveModules
    if (Array.isArray(activeModules)) {
      await Promise.all(
        activeModules.map((m) =>
          RoleActiveModule.create({
            RoleId: role.id,
            ModuleId: m.ModuleId,
            canView: m.canView || false,
            canAdd: m.canAdd || false,
            canEdit: m.canEdit || false,
            canDelete: m.canDelete || false,
          })
        )
      );
    }

    // Simpan ke RoleOtherModules
    if (Array.isArray(otherModules)) {
      await Promise.all(
        otherModules.map((m) =>
          RoleOtherModule.create({
            RoleId: role.id,
            ModuleName: m.ModuleName,
          })
        )
      );
    }

    res.status(201).json({ message: "Role berhasil dibuat", role });
  } catch (err) {
    console.error("Role create error:", err);
    res.status(500).json({ message: "Gagal membuat role", error: err.message });
  }
};

// Get all roles
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [
        {
          model: RoleActiveModule,
          as: "activeModules",
          include: [{ model: Module, as: "Module" }],
        },
        { model: RoleOtherModule, as: "otherModules" },
      ],
    });

    res.json(roles);
  } catch (err) {
    console.error("Role get error:", err);
    res.status(500).json({ message: "Gagal mengambil role", error: err.message });
  }
};

// Update role by ID
exports.updateRole = async (req, res) => {
  const { id } = req.params;
  const { name, activeModules, otherModules, blockedCategories } = req.body; // tambahkan blockedCategories

  try {
    // ===== Update role name =====
    const role = await Role.findByPk(id);
    if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });
    await role.update({ name });

    // ===== RoleActiveModules =====
    const existingActive = await RoleActiveModule.findAll({ where: { RoleId: id } });
    const existingActiveMap = new Map(existingActive.map(m => [m.ModuleId, m]));
    for (const m of activeModules) {
      const anyChecked = m.canAdd || m.canEdit || m.canDelete || m.canView;
      if (existingActiveMap.has(m.ModuleId)) {
        if (anyChecked) {
          await RoleActiveModule.update(
            {
              canAdd: m.canAdd,
              canEdit: m.canEdit,
              canDelete: m.canDelete,
              canView: m.canView,
            },
            { where: { RoleId: id, ModuleId: m.ModuleId } }
          );
        } else {
          await RoleActiveModule.destroy({ where: { RoleId: id, ModuleId: m.ModuleId } });
        }
      } else if (anyChecked) {
        await RoleActiveModule.create({
          RoleId: id,
          ModuleId: m.ModuleId,
          canAdd: m.canAdd,
          canEdit: m.canEdit,
          canDelete: m.canDelete,
          canView: m.canView,
        });
      }
    }

    // ===== RoleOtherModules =====
    const existingOther = await RoleOtherModule.findAll({ where: { RoleId: id } });
    const existingOtherMap = new Map(existingOther.map(m => [m.ModuleName, m]));
    for (const m of otherModules) {
      if (m.selected) {
        if (!existingOtherMap.has(m.ModuleName)) {
          await RoleOtherModule.create({ RoleId: id, ModuleName: m.ModuleName });
        }
      } else {
        if (existingOtherMap.has(m.ModuleName)) {
          await RoleOtherModule.destroy({ where: { RoleId: id, ModuleName: m.ModuleName } });
        }
      }
    }

    // ===== Blocked Categories =====
    // Hapus semua yang lama
    await BlockedCategory.destroy({ where: { RoleId: id } });

    // Simpan yang baru
    if (Array.isArray(blockedCategories)) {
      await Promise.all(
    blockedCategoriesPayload.map(c =>
        BlockedCategory.create({
        RoleId: id,
        CategoryId: c.id
        })
    )
    );
    }

    res.json({ message: "Role berhasil diperbarui" });
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ message: "Gagal memperbarui role", error: err.message });
  }
};

// Get role detail by ID
exports.getRoleDetail = async (req, res) => {
  const { id } = req.params;

  try {
    // Ambil role beserta activeModules dan otherModules
    const role = await Role.findByPk(id, {
      include: [
        {
          model: RoleActiveModule,
          as: "activeModules",
          include: [{ model: Module, as: "Module" }],
        },
        {
          model: RoleOtherModule,
          as: "otherModules",
        },
      ],
    });

    if (!role) return res.status(404).json({ message: "Role tidak ditemukan" });

    // Ambil semua modul tipe 'other' (master)
    const allOtherModules = await Module.findAll({ where: { type: "other" } });

    // Ambil kategori blocked untuk role ini
    const blockedCategories = await BlockedCategory.findAll({
      where: { RoleId: id },       // pakai RoleId
      include: [{ model: Category, as: 'category' }] // pakai alias 'category'
    });

    res.json({
      role,
      allOtherModules,
      blockedCategories: blockedCategories.map(bc => ({
        id: bc.category.id,
        name: bc.category.name,
      })),
    });
  } catch (err) {
    console.error("Get role detail error:", err);
    res.status(500).json({ message: "Gagal mengambil detail role", error: err.message });
  }
};

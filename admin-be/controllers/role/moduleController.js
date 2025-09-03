const db = require("../../models");
const Module = db.Module;

exports.getModules = async (req, res) => {
  try {
    const modules = await Module.findAll({
      order: [['type', 'ASC'], ['name', 'ASC']], // urut main dulu, lalu other
    });
    res.json(modules);
  } catch (err) {
    console.error("Get modules error:", err);
    res.status(500).json({ message: "Gagal mengambil modul", error: err.message });
  }
};

exports.createModule = async (req, res) => {
  try {
    const { name, type, description } = req.body;
    const module = await Module.create({ name, type, description });
    res.status(201).json({ message: "Module berhasil dibuat", module });
  } catch (err) {
    console.error("Create module error:", err);
    res.status(500).json({ message: "Gagal membuat modul", error: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, description } = req.body;

    const module = await Module.findByPk(id);
    if (!module) return res.status(404).json({ message: "Module tidak ditemukan" });

    await module.update({ name, type, description });
    res.json({ message: "Module berhasil diperbarui", module });
  } catch (err) {
    console.error("Update module error:", err);
    res.status(500).json({ message: "Gagal memperbarui modul", error: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const { id } = req.params;
    const module = await Module.findByPk(id);
    if (!module) return res.status(404).json({ message: "Module tidak ditemukan" });

    await module.destroy();
    res.json({ message: "Module berhasil dihapus" });
  } catch (err) {
    console.error("Delete module error:", err);
    res.status(500).json({ message: "Gagal menghapus modul", error: err.message });
  }
};

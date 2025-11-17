const { ListingType } = require('../../models');

module.exports = {

  // GET ALL
  async getAll(req, res) {
    try {
      const data = await ListingType.findAll();
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // CREATE
  async create(req, res) {
    try {
      const { name, parameter } = req.body;

      const data = await ListingType.create({
        name,
        parameter: typeof parameter === "object" ? JSON.stringify(parameter) : parameter
      });

      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // UPDATE
  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, parameter } = req.body;

      const item = await ListingType.findByPk(id);
      if (!item) return res.status(404).json({ success: false, message: "Not found" });

      await item.update({
        name,
        parameter: typeof parameter === "object" ? JSON.stringify(parameter) : parameter
      });

      res.json({ success: true, data: item });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // DELETE
  async delete(req, res) {
    try {
      const { id } = req.params;

      const item = await ListingType.findByPk(id);
      if (!item) return res.status(404).json({ success: false, message: "Not found" });

      await item.destroy();

      res.json({ success: true, message: "Deleted" });

    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};
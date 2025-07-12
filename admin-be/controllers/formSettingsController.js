const { FormSetting } = require('../models');

module.exports = {
  async getSettings(req, res) {
    try {
      const data = await FormSetting.findOne();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async updateSettings(req, res) {
    try {
      let data = await FormSetting.findOne();
  
      if (!data) {
        // Buat baru jika belum ada
        data = await FormSetting.create(req.body);
      } else {
        // Update data lama
        await data.update(req.body);
      }
  
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }  
};

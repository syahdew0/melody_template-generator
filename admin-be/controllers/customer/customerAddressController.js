const { CustomerAddress, sequelize } = require('../models');

module.exports = {
  async list(req, res) {
    try {
      const customer_id = req.customer.id;
      const addresses = await CustomerAddress.findAll({ where: { customer_id }, order: [['is_default', 'DESC']] });
      res.json(addresses);
    } catch(err) {
      res.status(500).json({ message: 'Gagal ambil alamat', error: err.message });
    }
  },

  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const customer_id = req.customer.id;
      const payload = { ...req.body, customer_id };

      // jika alamat default baru, hapus default lama
      if(payload.is_default) {
        await CustomerAddress.update({ is_default: false }, { where: { customer_id }, transaction: t });
      }

      const address = await CustomerAddress.create(payload, { transaction: t });
      await t.commit();
      res.status(201).json(address);
    } catch(err) {
      await t.rollback();
      res.status(500).json({ message: 'Gagal tambah alamat', error: err.message });
    }
  },

  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const customer_id = req.customer.id;
      const id = req.params.id;
      const payload = req.body;

      if(payload.is_default) {
        await CustomerAddress.update({ is_default: false }, { where: { customer_id }, transaction: t });
      }

      const updated = await CustomerAddress.update(payload, { where: { id, customer_id }, returning: true, transaction: t });
      await t.commit();
      res.json(updated[1][0]);
    } catch(err) {
      await t.rollback();
      res.status(500).json({ message: 'Gagal update alamat', error: err.message });
    }
  },

  async delete(req, res) {
    try {
      const customer_id = req.customer.id;
      const id = req.params.id;
      await CustomerAddress.destroy({ where: { id, customer_id } });
      res.json({ message: 'Alamat dihapus' });
    } catch(err) {
      res.status(500).json({ message: 'Gagal hapus alamat', error: err.message });
    }
  }
}

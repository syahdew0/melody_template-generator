'use strict';

const fs = require('fs');
const path = require('path');
const { CustomerAddress, sequelize } = require('../models');

function loadJSON(filePath) {
  const fullPath = path.join(__dirname, '..', 'data', 'indonesia', filePath);
  return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
}

const provinsi = loadJSON('provinsi.json');

module.exports = {
  // List alamat customer
  async list(req, res) {
    try {
      const customer_id = req.customer.id;
      const addresses = await CustomerAddress.findAll({
        where: { customer_id },
        order: [['is_default', 'DESC']]
      });

      res.json(addresses);
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil alamat', error: err.message });
    }
  },

  // Tambah alamat baru
  async create(req, res) {
    const t = await sequelize.transaction();
    try {
      const customer_id = req.customer.id;
      const payload = {
        ...req.body,
        customer_id,
        province: req.body.province || '',
        city: req.body.city || '',
        district: req.body.district || '',
        province_id: req.body.province_id || null,
        regency_id: req.body.regency_id || null,
        district_id: req.body.district_id || null,
        village_id: req.body.village_id || null,
      };

      if (payload.is_default) {
        await CustomerAddress.update(
          { is_default: false },
          { where: { customer_id }, transaction: t }
        );
      }

      const address = await CustomerAddress.create(payload, { transaction: t });
      await t.commit();

      res.status(201).json(address);
    } catch (err) {
      if (!t.finished) await t.rollback();
      res.status(500).json({ message: 'Gagal tambah alamat', error: err.message });
    }
  },

  // Update alamat
  async update(req, res) {
    const t = await sequelize.transaction();
    try {
      const customer_id = req.customer.id;
      const id = req.params.id;

      const payload = {
        ...req.body,
        province: req.body.province || '',
        city: req.body.city || '',
        district: req.body.district || '',
        province_id: req.body.province_id || null,
        regency_id: req.body.regency_id || null,
        district_id: req.body.district_id || null,
        village_id: req.body.village_id || null,
      };

      if (payload.is_default) {
        await CustomerAddress.update(
          { is_default: false },
          { where: { customer_id }, transaction: t }
        );
      }

      const [affectedCount] = await CustomerAddress.update(payload, {
        where: { id, customer_id },
        transaction: t
      });

      if (affectedCount === 0) {
        if (!t.finished) await t.rollback();
        return res.status(404).json({ message: 'Alamat tidak ditemukan' });
      }

      const updated = await CustomerAddress.findOne({ where: { id, customer_id }, transaction: t });
      await t.commit();

      res.json(updated);
    } catch (err) {
      if (!t.finished) await t.rollback();
      res.status(500).json({ message: 'Gagal update alamat', error: err.message });
    }
  },

  // Hapus alamat
  async delete(req, res) {
    try {
      const customer_id = req.customer.id;
      const id = req.params.id;
      const deleted = await CustomerAddress.destroy({ where: { id, customer_id } });

      if (deleted) {
        res.json({ message: 'Alamat dihapus' });
      } else {
        res.status(404).json({ message: 'Alamat tidak ditemukan' });
      }
    } catch (err) {
      res.status(500).json({ message: 'Gagal hapus alamat', error: err.message });
    }
  },

  // Ambil semua provinsi
async provinces(req, res) {
  try {
    const provs = provinsi.map(p => ({ id: p.id, name: p.nama }));
    res.json(provs);
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil provinsi', error: err.message });
  }
},

// Ambil kabupaten per provinsi
async regencies(req, res) {
  const { province_id } = req.query;
  if (!province_id) {
    return res.status(400).json({ message: 'province_id wajib' });
  }

  // path RELATIF untuk loadJSON
  const relativePath = path.join('kabupaten', `${province_id}.json`);
  const fullPath = path.join(__dirname, '..', 'data', 'indonesia', relativePath);

  if (!fs.existsSync(fullPath)) {
    return res.json([]);
  }

  const kabupaten = loadJSON(relativePath);
  res.json(kabupaten.map(k => ({ id: k.id, name: k.nama })));
},

  // Ambil kecamatan per kabupaten
async districts(req, res) {
  const { regency_id } = req.query;
  if (!regency_id) {
    return res.status(400).json({ message: 'regency_id wajib' });
  }

  const relativePath = path.join('kecamatan', `${regency_id}.json`);
  const fullPath = path.join(__dirname, '..', 'data', 'indonesia', relativePath);

  if (!fs.existsSync(fullPath)) {
    return res.json([]);
  }

  const kecamatan = loadJSON(relativePath);
  res.json(kecamatan.map(k => ({ id: k.id, name: k.nama })));
},

  // Ambil kelurahan per kecamatan
async villages(req, res) {
  const { district_id } = req.query;
  if (!district_id) {
    return res.status(400).json({ message: 'district_id wajib' });
  }

  const relativePath = path.join('kelurahan', `${district_id}.json`);
  const fullPath = path.join(__dirname, '..', 'data', 'indonesia', relativePath);

  if (!fs.existsSync(fullPath)) {
    return res.json([]);
  }

  const kelurahan = loadJSON(relativePath);
  res.json(kelurahan.map(k => ({ id: k.id, name: k.nama })));
}
};
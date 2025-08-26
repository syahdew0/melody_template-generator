const fs = require('fs')
const path = require('path')
const { CustomerAddress, sequelize } = require('../../models')

// Load regions.json
const RegionData = JSON.parse(fs.readFileSync(path.join(__dirname, '../../data/regions.json'), 'utf-8'))

// Fungsi bantu mapping province & city ke DB
function mapRegionIds(payload) {
  // Provinsi
  const prov = RegionData.find(p => p.provinsi === payload.province_name)
  if (prov) {
    payload.province = prov.provinsi
    // Kota/Kabupaten
    if (payload.city_name) {
      const city = prov.kota.find(c => c === payload.city_name)
      payload.city = city || payload.city || ''
    } else {
      payload.city = payload.city || ''
    }
  }
  // Kecamatan manual
  payload.district = payload.district_name || payload.district || ''
  return payload
}

module.exports = {
  // List alamat customer
  async list(req, res) {
    try {
      const customer_id = req.customer.id
      const addresses = await CustomerAddress.findAll({
        where: { customer_id },
        order: [['is_default', 'DESC']]
      })

      const enriched = addresses.map(addr => ({
        ...addr.toJSON(),
        province_name: addr.province_name || addr.province,
        city_name: addr.city_name || addr.city,
        district_name: addr.district_name || addr.district
      }))

      res.json(enriched)
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil alamat', error: err.message })
    }
  },

  // Tambah alamat baru
  async create(req, res) {
    const t = await sequelize.transaction()
    try {
      const customer_id = req.customer.id
      let payload = { ...req.body, customer_id }

      payload = mapRegionIds(payload)

      if (payload.is_default) {
        await CustomerAddress.update(
          { is_default: false },
          { where: { customer_id }, transaction: t }
        )
      }

      const address = await CustomerAddress.create(payload, { transaction: t })
      await t.commit()

      res.status(201).json({
        ...address.toJSON(),
        province_name: address.province_name || address.province,
        city_name: address.city_name || address.city,
        district_name: address.district_name || address.district
      })
    } catch (err) {
      if (!t.finished) await t.rollback()
      res.status(500).json({ message: 'Gagal tambah alamat', error: err.message })
    }
  },

  // Update alamat
async update(req, res) {
  const t = await sequelize.transaction()
  try {
    const customer_id = req.customer.id
    const id = req.params.id
    let payload = mapRegionIds({ ...req.body })

    if (payload.is_default) {
      await CustomerAddress.update(
        { is_default: false },
        { where: { customer_id }, transaction: t }
      )
    }

    // Update alamat
    const [affectedCount] = await CustomerAddress.update(payload, {
      where: { id, customer_id },
      transaction: t
    })

    if (affectedCount === 0) {
      if (!t.finished) await t.rollback()
      return res.status(404).json({ message: 'Alamat tidak ditemukan' })
    }

    // Ambil data terbaru
    const updated = await CustomerAddress.findOne({ where: { id, customer_id }, transaction: t })
    await t.commit()

    res.json({
      ...updated.toJSON(),
      province_name: updated.province || '',
      city_name: updated.city || '',
      district_name: updated.district || ''
    })
  } catch (err) {
    if (!t.finished) await t.rollback()
    res.status(500).json({ message: 'Gagal update alamat', error: err.message })
  }
},

  // Hapus alamat
  async delete(req, res) {
    try {
      const customer_id = req.customer.id
      const id = req.params.id
      const deleted = await CustomerAddress.destroy({ where: { id, customer_id } })
      if (deleted) {
        res.json({ message: 'Alamat dihapus' })
      } else {
        res.status(404).json({ message: 'Alamat tidak ditemukan' })
      }
    } catch (err) {
      res.status(500).json({ message: 'Gagal hapus alamat', error: err.message })
    }
  },

  // Ambil semua provinsi
  async provinces(req, res) {
    try {
      const provs = RegionData.map(p => ({ name: p.provinsi }))
      res.json(provs)
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil provinsi', error: err.message })
    }
  },

  // Ambil kota/kabupaten berdasarkan nama provinsi
  async regencies(req, res) {
    try {
      const { province_name } = req.query
      let cities = []

      if (province_name) {
        const prov = RegionData.find(p => p.provinsi === province_name)
        if (prov) cities = prov.kota
      }

      res.json(cities.map(c => ({ name: c })))
    } catch (err) {
      res.status(500).json({ message: 'Gagal ambil kota/kabupaten', error: err.message })
    }
  },

  // Kecamatan manual
  async districts(req, res) {
    res.json([]) // kosong, bisa diubah jika mau
  }
}

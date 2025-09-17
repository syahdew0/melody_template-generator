const { MlmPengaduan, Customer } = require('../../models');

module.exports = {
  // Admin lihat semua pengaduan
  async getAll(req, res) {
    try {
      const pengaduans = await MlmPengaduan.findAll({
        order: [['createdAt', 'DESC']],
      });
      return res.json({ data: pengaduans });
    } catch (err) {
      console.error('getAll pengaduan error:', err);
      return res.status(500).json({ message: 'Gagal mengambil data pengaduan' });
    }
  },

async getById(req, res) {
  try {
    const { id } = req.params;
    const pengaduan = await MlmPengaduan.findByPk(id);
    if (!pengaduan) {
      return res.status(404).json({ message: 'Pengaduan tidak ditemukan' });
    }
    return res.json({ data: pengaduan });
  } catch (err) {
    console.error('getById pengaduan error:', err);
    return res.status(500).json({ message: 'Gagal mengambil detail pengaduan' });
  }
},

  // Admin update status/prioritas
  async updatePengaduan(req, res) {
    try {
      const { id } = req.params;
      const { status, priority } = req.body;

      const pengaduan = await MlmPengaduan.findByPk(id);
      if (!pengaduan) {
        return res.status(404).json({ message: 'Pengaduan tidak ditemukan' });
      }

      if (status) pengaduan.status = status;
      if (priority) pengaduan.priority = priority;
      pengaduan.updated_by = req.customer?.username || 'admin';

      await pengaduan.save();

      return res.json({
        message: 'Pengaduan berhasil diperbarui',
        data: pengaduan,
      });
    } catch (err) {
      console.error('updatePengaduan error:', err);
      return res.status(500).json({ message: 'Gagal memperbarui pengaduan' });
    }
  },
};

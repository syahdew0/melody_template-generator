const { MlmPengaduan, Customer } = require('../../models');

module.exports = {
  // Customer buat pengaduan
  async createPengaduan(req, res) {
    try {
      const { subject, message } = req.body;

      if (!subject || !message) {
        return res.status(400).json({ message: 'Subject dan message wajib diisi' });
      }

      // Ambil username dari customer hasil middleware
      const username = req.customer?.username; 
      if (!username) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const pengaduan = await MlmPengaduan.create({
        username,
        subject,
        message,
        status: 'pending',
        priority: 'medium',
        created_by: username,
      });

      return res.status(201).json({
        message: 'Pengaduan berhasil dikirim',
        data: pengaduan,
      });
    } catch (err) {
      console.error('createPengaduanviews/ error:', err);
      return res.status(500).json({ message: 'Gagal membuat pengaduan' });
    }
  },
};

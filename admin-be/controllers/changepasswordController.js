const { Customer } = require('../models');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


exports.changePassword = async (req, res) => {
  try {
    const customerId = req.customer.id;
    const { old_password, new_password, confirm_password } = req.body;

    if (!old_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    }

    const customer = await Customer.findByPk(customerId);
    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan.' });
    }

    const isMatch = await bcrypt.compare(old_password, customer.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Password lama salah.' });
    }

    const hashedNewPassword = await bcrypt.hash(new_password, 10);
    customer.password = hashedNewPassword;
    await customer.save();

    res.json({ message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Gagal mengganti password:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat mengganti password.' });
  }
};
exports.requestPasswordChangeCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email wajib diisi' });
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(400).json({ message: 'Email tidak ditemukan.' });
    }

    // Generate kode 6 karakter alfanumerik
    const code = crypto.randomBytes(3).toString('hex').toUpperCase().trim();

    // Simpan kode & expiry (15 menit)
    customer.password_reset_code = code;
    customer.password_reset_expires_at = new Date(Date.now() + 15 * 60 * 1000);
    await customer.save();

    console.log(`[DEBUG] Kode untuk ${email}: "${code}"`);

    await sendEmail({
      to: customer.email,
      subject: 'Kode Verifikasi Ganti Password',
      text: `Kode verifikasi untuk ganti password Anda: ${code}`
    });

    res.json({ message: 'Kode verifikasi telah dikirim ke email Anda.' });
  } catch (err) {
    console.error('Error requestPasswordChangeCode:', err);
    res.status(500).json({ message: 'Gagal mengirim kode verifikasi password.' });
  }
};

exports.changePasswordWithCode = async (req, res) => {
  try {
    const { email, code, new_password, confirm_password } = req.body;

    if (!email || !code || !new_password || !confirm_password) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    }

    const customer = await Customer.findOne({ where: { email } });
    if (!customer) {
      return res.status(400).json({ message: 'Email tidak ditemukan.' });
    }

    // Ambil kode dari DB dan trim + uppercase
    const savedCode = (customer.password_reset_code || '').trim().toUpperCase();
    const inputCode = code.trim().toUpperCase();

    console.log(`[DEBUG] Input code: "${inputCode}", Saved code: "${savedCode}"`);

    if (!savedCode || savedCode !== inputCode) {
      return res.status(400).json({ message: 'Kode verifikasi salah.' });
    }

    // Cek expiry
    if (!customer.password_reset_expires_at || new Date() > customer.password_reset_expires_at) {
      return res.status(400).json({ message: 'Kode verifikasi sudah kedaluwarsa.' });
    }

    // Hash password baru & reset kode
    customer.password = await bcrypt.hash(new_password, 10);
    customer.password_reset_code = null;
    customer.password_reset_expires_at = null;
    await customer.save();
    
console.log({
  email,
  inputCode: code,
  savedCode: customer.password_reset_code,
  expiresAt: customer.password_reset_expires_at,
  now: new Date()
});

    res.json({ message: 'Password berhasil diubah.' });
  } catch (error) {
    console.error('Error changePasswordWithCode:', error);
    res.status(500).json({ message: 'Gagal mengganti password.' });
  }
};
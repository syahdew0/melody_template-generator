const { Customer, Wallet } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  try {
    const {
      username, email, no_hp, bank,
      no_rekening, nama_rekening, referral, password
    } = req.body;

    const existingUser = await Customer.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Username sudah terdaftar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await Customer.create({
      username, email, no_hp, bank, no_rekening, nama_rekening, referral,
      password: hashedPassword
    });

     // Tambahkan wallet default setelah customer berhasil dibuat
    await Wallet.create({
    customer_id: newUser.id,
    username: newUser.username,
    wallet_type: 'saldo',
    balance: 0,
    createdon: new Date(),
    updatedon: new Date()
  });

    res.json({ success: true, message: 'Registrasi berhasil', data: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Terjadi kesalahan saat register' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cek apakah user ada
    const user = await Customer.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email tidak ditemukan' });
    }

    // Cek password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Password salah' });
    }

    // Generate token
    // const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'mysecret', {
    //   expiresIn: '7d'
    // });
    const token = jwt.sign(
    { CustomerId: user.id, email: user.email },
    process.env.JWT_CUSTOMER_SECRET || 'customer_secret_123',
    { expiresIn: '7d' }
  )

    res.json({
  message: 'Login berhasil',
  data: {
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  }
});

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Terjadi kesalahan saat login' });
  }
};

exports.me = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id, {
      attributes: ['id', 'username', 'email', 'no_hp', 'bank', 'no_rekening', 'nama_rekening']
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }

    const wallet = await Wallet.findOne({
      where: { customer_id: req.customer.id }
    });

    res.json({
      id: customer.id,
      username: customer.username,
      email: customer.email,
      no_hp: customer.no_hp,
      bank: customer.bank,
      no_rekening: customer.no_rekening,
      nama_rekening: customer.nama_rekening,
      balance: wallet?.balance || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data customer' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.customer.id)
    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' })
    }

    const { no_hp, bank, no_rekening, nama_rekening } = req.body

    customer.no_hp = no_hp
    customer.bank = bank
    customer.no_rekening = no_rekening
    customer.nama_rekening = nama_rekening

    await customer.save()

    res.json({ message: 'Profil berhasil diperbarui', data: customer })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Gagal memperbarui profil' })
  }
};

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
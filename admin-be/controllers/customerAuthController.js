const { Customer } = require('../models');
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
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'mysecret', {
      expiresIn: '7d'
    });

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



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
      attributes: ['id', 'username', 'email']
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer tidak ditemukan' });
    }

    const wallet = await Wallet.findOne({
      where: { customer_id: req.customer.id }
    });

    res.json({
      id: customer.id,
      name: customer.username, 
      email: customer.email,
      balance: wallet?.balance || 0
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengambil data customer' });
  }
};
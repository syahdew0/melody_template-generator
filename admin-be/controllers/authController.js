

// controllers/authController.js
const { User } = require('../models')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const transporter = require('../utils/mailer')

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: 'Semua field harus diisi' })
    }

    const existing = await User.findOne({ where: { email } })
    if (existing) return res.status(400).json({ message: 'Email sudah terdaftar' })

    const totalUser = await User.count()
    const isSuperAdmin = totalUser === 0
    const role = isSuperAdmin ? 'admin' : 'user'

    const hashed = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      username,
      email,
      password: hashed,
      role,
      isSuperAdmin,
    })

    res.status(201).json({ message: 'Registrasi berhasil', user })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: err.message })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ message: 'Password salah' })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '2h' }
    )

    res.json({ message: 'Login berhasil', token, user })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'username', 'email', 'role', 'avatar']
    })

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ where: { email } })
    if (!user) return res.status(404).json({ message: 'Email tidak ditemukan' })

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_RESET_SECRET || 'RESET_SECRET_KEY',
      { expiresIn: '15m' }
    )

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: email,
      subject: 'Reset Password InteRuma',
      html: `
        <p>Halo,</p>
        <p>Klik tombol di bawah ini untuk reset password Anda:</p>
        <a href="${resetLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 15px;border-radius:5px;text-decoration:none;">Reset Password</a>
        <p>Link ini hanya berlaku selama 15 menit.</p>
      `
    })

    res.json({ message: 'Link reset telah dikirim ke email Anda.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET || 'RESET_SECRET_KEY')

    const user = await User.findByPk(decoded.id)
    if (!user) return res.status(404).json({ message: 'User tidak ditemukan' })

    const hashed = await bcrypt.hash(password, 10)
    user.password = hashed
    await user.save()

    res.json({ message: 'Password berhasil direset.' })
  } catch (err) {
    res.status(400).json({ message: 'Token tidak valid atau kedaluwarsa.' })
  }
}



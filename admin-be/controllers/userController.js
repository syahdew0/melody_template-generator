const db = require('../models');
const bcrypt = require('bcrypt');
const User = db.User;

exports.getAllUsers = async (req, res) => {
  const users = await User.findAll({
    attributes: ['id', 'username', 'email', 'role', 'isSuperAdmin']
  });  
  res.json(users);
};

exports.createUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Validasi input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Field wajib tidak boleh kosong' });
  }

  // Cek apakah user pertama
  const totalUser = await User.count();
  const isSuperAdmin = totalUser === 0;

  const hash = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hash,
    email,
    role: role || (isSuperAdmin ? 'admin' : 'user'),
    isSuperAdmin,
  });

  res.status(201).json(user);
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, email, password, role } = req.body;

  // Hapus isSuperAdmin jika dikirim dari frontend
  if ('isSuperAdmin' in req.body) delete req.body.isSuperAdmin;

  const updates = { username, email, role };
  if (password) {
    updates.password = await bcrypt.hash(password, 10);
  }

  await User.update(updates, { where: { id } });

  res.json({ message: 'User updated' });
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  // Cegah user menghapus dirinya sendiri
  if (parseInt(id) === req.user.id) {
    return res.status(403).json({ message: 'Tidak bisa menghapus akun sendiri.' });
  }

  // Ambil user target yang ingin dihapus
  const targetUser = await User.findByPk(id);
  if (!targetUser) {
    return res.status(404).json({ message: 'User tidak ditemukan' });
  }

  // Cegah penghapusan superadmin
  if (targetUser.isSuperAdmin) {
    return res.status(403).json({ message: 'Tidak bisa menghapus superadmin.' });
  }

  await User.destroy({ where: { id } });
  res.json({ message: 'User berhasil dihapus' });
};

exports.promoteToAdmin = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: 'User tidak ditemukan' });
  user.role = 'admin';
  await user.save();
  res.json({ message: 'User sekarang adalah admin', user });
};
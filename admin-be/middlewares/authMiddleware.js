const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    req.user = decoded;

    // Buat token baru dengan expiry 2 jam dari sekarang
    const newToken = jwt.sign(
      {
        UserId: decoded.UserId,
        RoleId: decoded.RoleId,
        OwnerId: decoded.OwnerId,
        role: decoded.role,
      },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '2h' }
    );

    // Kirim token baru di header
    res.setHeader('x-refreshed-token', newToken);

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};


exports.requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Hanya admin yang dapat mengakses' })
  }
  next()
}

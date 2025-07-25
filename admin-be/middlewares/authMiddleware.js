const jwt = require('jsonwebtoken');

exports.requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // const { isFrontend } = req.query;
  // if (isFrontend == "true") return next();
  if (!token) return res.status(401).json({ message: 'Token tidak ditssssemukan1', data: req.query });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'SECRET_KEY');
    req.user = decoded;

    const newToken = jwt.sign({
      UserId: decoded.UserId,
      RoleId: decoded.RoleId,
      OwnerId: decoded.OwnerId,
      role: decoded.role,
    }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '2h' });

    res.set('x-refreshed-token', newToken);

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

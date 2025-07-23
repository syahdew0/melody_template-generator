const jwt = require('jsonwebtoken');

const authenticateCustomer = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token customer tidak ditemukan' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_CUSTOMER_SECRET || 'CUSTOMER_SECRET_KEY');
    req.customer = decoded;

    const newToken = jwt.sign({
      CustomerId: decoded.CustomerId,
      email: decoded.email,
    }, process.env.JWT_CUSTOMER_SECRET || 'CUSTOMER_SECRET_KEY', { expiresIn: '2h' });

    res.set('x-refreshed-token', newToken);
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token customer tidak valid' });
  }
};

module.exports = authenticateCustomer;

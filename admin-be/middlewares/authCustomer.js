const jwt = require('jsonwebtoken');
const { Customer } = require('../models');

const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token tidak ditemukan' });
    }

    const token = authHeader.split(' ')[1];

    console.log('Token:', token);
    console.log('Secret:', process.env.JWT_CUSTOMER_SECRET || 'customer_secret_123');

    const decoded = jwt.verify(token, process.env.JWT_CUSTOMER_SECRET || 'customer_secret_123');

    const customer = await Customer.findByPk(decoded.CustomerId);

    if (!customer) {
      return res.status(401).json({ message: 'Customer tidak ditemukan' });
    }

    req.customer = customer;
    next();
  } catch (error) {
    console.error('JWT verify error:', error);
    return res.status(401).json({ message: 'Token tidak valid', error: error.message });
  }
};

module.exports = authenticateCustomer;


// const jwt = require('jsonwebtoken');
// const { Customer } = require('../models');

// module.exports = async function authenticateCustomer(req, res, next) {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith('Bearer ')) {
//     return res.status(401).json({ message: 'Token tidak ditemukan' });
//   }

//   const token = authHeader.split(' ')[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET); 
//     const customer = await Customer.findByPk(decoded.id);

//     if (!customer) {
//       return res.status(401).json({ message: 'Customer tidak valid' });
//     }

//     req.customer = customer;
//     req.user = customer; 
//     next();
//   } catch (err) {
//     console.error('Auth error:', err);
//     return res.status(401).json({ message: 'Token tidak valid' });
//   }
// };

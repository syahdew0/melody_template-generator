// middleware/contactValidation.js
const { body, validationResult } = require('express-validator');

// Validation rules untuk contact message
const validateContactMessage = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nama harus antara 2-100 karakter')
    .matches(/^[a-zA-Z\s\u00C0-\u017F]+$/)
    .withMessage('Nama hanya boleh mengandung huruf dan spasi'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email tidak valid')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email terlalu panjang'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\+]?[0-9\s\-\(\)]{10,20}$/)
    .withMessage('Format nomor telepon tidak valid'),
  
  body('subject')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Subjek maksimal 200 karakter'),
  
  body('message')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Pesan harus antara 10-5000 karakter')
];

// Validation rules untuk newsletter subscription
const validateNewsletterSubscription = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Format email tidak valid')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email terlalu panjang')
];

// Validation rules untuk contact form settings
const validateContactFormSettings = [
  body('formHeader')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Header form harus antara 1-200 karakter'),
  
  body('formLabels')
    .optional()
    .isObject()
    .withMessage('Form labels harus berupa object'),
  
  body('formPlaceholders')
    .optional()
    .isObject()
    .withMessage('Form placeholders harus berupa object'),
  
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects harus berupa array'),
  
  body('newsletter')
    .optional()
    .isObject()
    .withMessage('Newsletter settings harus berupa object'),
  
  body('contactInfo')
    .optional()
    .isObject()
    .withMessage('Contact info harus berupa object')
];

// Middleware untuk menangani validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Data tidak valid',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Rate limiting middleware untuk contact form
const contactRateLimit = (req, res, next) => {
  // Simple in-memory rate limiting
  // Dalam production, gunakan Redis atau database
  const clientIp = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5; // maksimal 5 request per 15 menit
  
  if (!global.contactRateLimitStore) {
    global.contactRateLimitStore = new Map();
  }
  
  const clientData = global.contactRateLimitStore.get(clientIp) || {
    count: 0,
    resetTime: now + windowMs
  };
  
  if (now > clientData.resetTime) {
    clientData.count = 0;
    clientData.resetTime = now + windowMs;
  }
  
  if (clientData.count >= maxRequests) {
    return res.status(429).json({
      success: false,
      message: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  global.contactRateLimitStore.set(clientIp, clientData);
  
  next();
};

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Remove potentially dangerous characters
  const sanitize = (str) => {
    if (typeof str !== 'string') return str;
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  };
  
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitize(req.body[key]);
      }
    });
  }
  
  next();
};

module.exports = {
  validateContactMessage,
  validateNewsletterSubscription,
  validateContactFormSettings,
  handleValidationErrors,
  contactRateLimit,
  sanitizeInput
};
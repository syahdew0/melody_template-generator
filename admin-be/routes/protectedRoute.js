const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

router.get('/admin-data', requireAuth, requireAdmin, (req, res) => {
  res.json({ message: 'Data rahasia hanya untuk admin', user: req.user });
});

module.exports = router;

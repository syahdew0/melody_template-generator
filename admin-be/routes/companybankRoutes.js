// const express = require('express');
// const router = express.Router();
// const companyBankController = require('../controllers/companybankController');

// const { requireAuth, requireAdmin } = require('../middlewares/authMiddleware');

// // router.get('/company-banks', companyBankController.getCompanyBanks);
// // Admin routes
// router.get('/', requireAuth, requireAdmin, companyBankController.getAll);
// router.post('/', requireAuth, requireAdmin, companyBankController.create);
// router.put('/:id', requireAuth, requireAdmin, companyBankController.update);
// router.delete('/:id', requireAuth, requireAdmin, companyBankController.remove);
// router.patch('/:id/deactivate', requireAuth, requireAdmin, companyBankController.deactivate);
// router.patch('/:id/activate', requireAuth, requireAdmin, companyBankController.activate);



// module.exports = router;

const express = require('express');
const router = express.Router();
const companyBankController = require('../controllers/companybankController');
const { requireAuth, requireModulePermission } = require('../middlewares/authMiddleware');


// Company Bank Routes

// List semua company bank
router.get(
  '/',
  requireAuth,
  requireModulePermission('company bank', 'canView'),
  companyBankController.getAll
);

// Tambah company bank
router.post(
  '/',
  requireAuth,
  requireModulePermission('company bank', 'canCreate'),
  companyBankController.create
);

// Update company bank
router.put(
  '/:id',
  requireAuth,
  requireModulePermission('company bank', 'canEdit'),
  companyBankController.update
);

// Hapus company bank
router.delete(
  '/:id',
  requireAuth,
  requireModulePermission('company bank', 'canDelete'),
  companyBankController.remove
);

// Nonaktifkan company bank
router.patch(
  '/:id/deactivate',
  requireAuth,
  requireModulePermission('company bank', 'canEdit'),
  companyBankController.deactivate
);

// Aktifkan company bank
router.patch(
  '/:id/activate',
  requireAuth,
  requireModulePermission('company bank', 'canEdit'),
  companyBankController.activate
);

module.exports = router;

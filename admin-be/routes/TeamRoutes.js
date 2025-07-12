const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

// GET /api/team → Get header and members (existing)
router.get('/', teamController.getTeamData);

// ADD: Endpoint terpisah untuk frontend admin
router.get('/header', teamController.getHeader);        // ✅ Tambah ini
router.get('/members', teamController.getMembers);      // ✅ Tambah ini

// Existing endpoints
router.put('/header', teamController.updateHeader);
router.post('/members', teamController.addMember);
router.put('/members/:id', teamController.updateMember);
router.delete('/members/:id', teamController.deleteMember);

module.exports = router;
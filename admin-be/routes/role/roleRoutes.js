const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/role/roleController");
const { requireAuth, requireAdmin  } = require('../../middlewares/authMiddleware');


// Create role
router.post("/", requireAuth, requireAdmin, roleController.createRole);

// Get all roles
router.get("/", requireAuth,requireAdmin, roleController.getRoles);

// Get role detail by ID
router.get("/:id", requireAuth, requireAdmin, roleController.getRoleDetail);
router.put("/:id", requireAuth, requireAdmin, roleController.updateRole);

module.exports = router;

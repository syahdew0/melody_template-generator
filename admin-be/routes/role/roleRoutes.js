const express = require("express");
const router = express.Router();
const roleController = require("../../controllers/role/roleController");
const { requireAuth,  } = require('../../middlewares/authMiddleware');


// Create role
router.post("/", requireAuth,  roleController.createRole);

// Get all roles
router.get("/", requireAuth,  roleController.getRoles);

// Get role detail by ID
router.get("/:id", requireAuth,  roleController.getRoleDetail);
router.put("/:id", requireAuth,  roleController.updateRole);

module.exports = router;

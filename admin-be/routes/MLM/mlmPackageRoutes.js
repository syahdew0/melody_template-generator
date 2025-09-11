const express = require('express');
const router = express.Router();
const mlmPackageController = require('../../controllers/MLM/mlmPackageController');
const { requireAuth } = require('../../middlewares/authMiddleware');

router.get("/", requireAuth, mlmPackageController.getAll);
// GET list paket (public)
router.get("/public", mlmPackageController.getAll);

// GET detail package by id
router.get("/:id", requireAuth, mlmPackageController.getById);

// CREATE package baru
router.post("/", requireAuth, mlmPackageController.create);

// UPDATE package
router.put("/:id", requireAuth, mlmPackageController.update);

// DELETE package
router.delete("/:id", requireAuth, mlmPackageController.delete);

module.exports = router;

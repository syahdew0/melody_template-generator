const express = require("express");
const router = express.Router();

const ListingController = require("../../controllers/listing/listingController");
const ListingTypeController = require("../../controllers/listing/listingtypeController");

// LISTING CRUD
router.get("/listing", ListingController.getAll);
router.get("/listing/:post_id", ListingController.getDetail);
router.post("/listing", ListingController.create);
router.put("/listing/:post_id", ListingController.update);
router.delete("/listing/:post_id", ListingController.delete);

// LISTING VALUES
router.get("/listing/:post_id/values", ListingController.getByPost);

// LISTING TYPE CRUD
router.get("/listing-type", ListingTypeController.getAll);
router.post("/listing-type", ListingTypeController.create);
router.put("/listing-type/:id", ListingTypeController.update);
router.delete("/listing-type/:id", ListingTypeController.delete);

module.exports = router;

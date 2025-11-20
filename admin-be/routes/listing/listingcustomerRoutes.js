const express = require("express");
const router = express.Router();

const ListingController = require("../../controllers/listing/listingController");

// CUSTOMER LISTING (READ ONLY)
router.get("/listing", ListingController.getAll);
router.get("/listing/:post_id", ListingController.getDetail);

module.exports = router;

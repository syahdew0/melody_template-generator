const express = require("express");
const router = express.Router();
const controller = require("../controllers/visiMisiController");

router.get("/visi-misi", controller.getVisiMisi);
router.post("/visi-misi", controller.saveVisiMisi);

module.exports = router;

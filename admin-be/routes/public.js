// routes/public.js
const express = require("express");
const router = express.Router();
const { Setting, Icon, Theme } = require("../models");

router.get("/public/site-info/:websiteId", async (req, res) => {
  try {
    const { websiteId } = req.params;

    const title = await Setting.findOne({ where: { key: "site_title", website_id: websiteId } });
    const favicon = await Icon.findOne({ where: { key: "favicon", website_id: websiteId } });
    const theme = await Theme.findOne({ where: { website_id: websiteId, is_active: true } });

    res.json({
      title: title?.value || "Default Title",
      icon: favicon?.url || "/favicon.png",
      activeTheme: theme?.slug || "default",
    });
  } catch (err) {
    res.status(500).json({ message: "Error get site info", error: err.message });
  }
});

module.exports = router;

// routes/menu.js
const express = require("express");
const { MenuItem } = require("../../models/menuItem");
const authMiddleware = require('../../middleware/authMiddleware'); // your JWT auth middleware
const router = express.Router();

// Get Menu Dashboard
router.get("/get-menuItems", authMiddleware,  async (req, res) => {
  try {
    const diet = req.query.diet;

    const menuItems = await MenuItem.find({ diet });

    if (menuItems.length === 0) {
      return res.status(404).json({ error: "No menu items found for this diet" });
    }

    // ✅ Find the latest updatedAt among all menu items
    const lastUpdated = menuItems.reduce((latest, item) => {
      return item.updatedAt > latest ? item.updatedAt : latest;
    }, menuItems[0].updatedAt);

    res.status(200).json({
      lastUpdated,
      menuItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
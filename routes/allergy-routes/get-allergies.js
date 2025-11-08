const express = require("express");
const { Allergy } = require("../../models/allergy");
const router = express.Router();

// GET route to fetch all allergies
router.get("/get-allergies", async (req, res) => {
  try {
    // ✅ Fetch all allergy documents from MongoDB
    const allergies = await Allergy.find();

    res.status(200).json({
      message: "Allergies fetched successfully",
      allergies
    });
  } catch (error) {
    console.error("Error fetching allergies:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const { DietFoodAlternative } = require("../../models/dietFoodAlternative");
const router = express.Router();

// GET route to fetch all diet food alternatives
router.get("/get-all-diet-food-alternative", async (req, res) => {
  try {
    // ✅ Fetch all diet food alternatives from MongoDB
    const dietFoodAlternatives = await DietFoodAlternative.find();

    res.status(200).json({
      message: "Diet food alternatives fetched successfully",
      dietFoodAlternatives
    });
  } catch (error) {
    console.error("Error fetching diet food alternatives:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
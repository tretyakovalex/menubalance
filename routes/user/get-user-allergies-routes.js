const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const authMiddleware = require('../../middleware/authMiddleware');

// GET all selected allergies for the logged-in user
router.get("/get-user-allergies", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch the user's allergy selections
    const userData = await User.findOne({ userId }).lean();

    if (!userData?.userAllergies?.length) {
      return res.status(200).json({
        success: true,
        userAllergies: [],
        message: "No allergies selected yet"
      });
    }

    // Return userAllergies exactly as stored
    res.status(200).json({
      success: true,
      userAllergies: userData.userAllergies
    });

  } catch (error) {
    console.error("Error fetching user allergies:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

module.exports = router;

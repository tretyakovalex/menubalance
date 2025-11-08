const express = require("express");
const router = express.Router();

const User = require("../../models/user"); // your userDataSchema model
const authMiddleware = require('../../middleware/authMiddleware'); // your JWT auth middleware

const { Allergy } = require("../../models/allergy");

// Update User Data Document (by userId from token)
router.put("/update-user-allergies", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { allergies } = req.body;

    if (!Array.isArray(allergies)) {
      return res.status(400).json({ message: "Invalid allergies array" });
    }

    // Find or create user's data document
    let userData = await User.findOne({ userId });
    if (!userData) {
      userData = new User({ userId, userAllergies: allergies });
    } else {
      userData.userAllergies = allergies; // overwrite with new array (handles deselects)
    }

    await userData.save();

    res.status(200).json({
      success: true,
      message: "User allergies updated successfully",
      userAllergies: userData.userAllergies
    });

  } catch (error) {
    console.error("Error updating user allergies:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});


module.exports = router;

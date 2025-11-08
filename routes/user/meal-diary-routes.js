const express = require("express");
const router = express.Router();
const { Types } = require("mongoose");

const User = require("../../models/user"); // your userDataSchema model
const authMiddleware = require('../../middleware/authMiddleware'); // JWT auth middleware

const { MenuItem } = require("../../models/menuItem"); // menuItem schema

// POST /add-meal-diary
router.post("/add-meal-diary", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // from auth middleware
    if (!userId) {
      return res.status(400).json({ error: "User not found!" });
    }

    const { dayIntroduced, mealTime, introducedProduct, reactionObserved, reactionType, severity, notes } = req.body;

    // Validate required fields
    if (reactionObserved === undefined) {
      return res.status(400).json({ error: "reactionObserved is required" });
    }

    // Find the user data
    const userData = await User.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ error: "No user data found" });
    }

    // Create a new meal diary entry
    const newMealEntry = {
      mealDiaryId: new Types.ObjectId(),
      dayIntroduced: dayIntroduced || null,
      mealTime: mealTime || null,
      introducedProduct: introducedProduct || null,
      reactionObserved,
      reactionType: reactionType || null,
      severity: severity !== undefined ? severity : null,
      notes: notes || null
    };

    // Add to mealDiary array
    userData.mealDiary.push(newMealEntry);

    // Save updated user data
    await userData.save();

    // Optionally, fetch all menu items for response
    const allMenuItems = await MenuItem.find({}, "_id title");

    res.status(200).json({
      message: "Meal diary entry added successfully",
      mealDiary: userData.mealDiary,
      shoppingList: userData.shoppingList,
      menuItems: allMenuItems
    });

  } catch (error) {
    console.error("Error adding meal diary entry:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

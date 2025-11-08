const express = require("express");
const router = express.Router();

const User = require("../../models/user");
const authMiddleware = require('../../middleware/authMiddleware'); // your JWT auth middleware

const { MenuItem } = require("../../models/menuItem"); // your menuItem schema
const user = require("../../models/user");

router.get("/get-user-shoppingList", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "User not found!" });
    }

    // Find user data and populate menuItemId with only _id and title
    const userData = await User.findOne({ userId })
      .populate({
        path: 'menusByDay.menuItems.menuItemId',
        model: 'MenuItem',
        select: '_id title image' // <== Select only _id and title fields
      })
      .lean();

    if (!userData) {
      return res.status(404).json({ error: "No user data found" });
    }

    // Extract and deduplicate menuItems
    const allMenuItems = userData.menusByDay
      .flatMap(day => day.menuItems)
      .map(item => item.menuItemId)
      .filter(item => item) // Remove any nulls
      .reduce((acc, item) => {
        // Deduplicate by _id
        if (!acc.some(existing => existing._id.toString() === item._id.toString())) {
          acc.push(item);
        }
        return acc;
      }, []);

    res.status(200).json({
      shoppingList: userData.shoppingList,
      menuItems: allMenuItems
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/update-user-shoppingList", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "User not found!" });
    }

    const updatedList = req.body.shoppingList;

    if (!Array.isArray(updatedList)) {
      return res.status(400).json({ error: "Invalid shopping list format" });
    }

    const userData = await User.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ error: "No user data found" });
    }

    // Build a quick lookup from incoming data
    const checkedStatusMap = {};
    updatedList.forEach(item => {
      if (item._id && typeof item.checked === 'boolean') {
        checkedStatusMap[item._id] = item.checked;
      }
    });

    // Update only `checked` status on matching items
    userData.shoppingList.forEach(item => {
      if (checkedStatusMap.hasOwnProperty(item._id.toString())) {
        item.checked = checkedStatusMap[item._id.toString()];
      }
    });

    await userData.save();

    res.status(200).json({ shoppingList: userData.shoppingList, message: "successufully updated shopping list" });

  } catch (error) {
    console.error("Error updating shopping list:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.get("/get-user-selectedMenu", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ error: "User not found!" });
    }

    const userData = await User.findOne({ userId })
      .populate('menusByDay.menuItems.menuItemId'); // 🔥 This is the key!

    if (!userData) {
      return res.status(404).json({ error: "No user data found" });
    }

    res.status(200).json({
      menuData: userData.menusByDay,
    });

  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Update User Data Document (by userId from token)
router.put("/update-user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, menuItemId, quantity = 1 } = req.body;

    if (!userId || !date || !menuItemId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const isoDate = new Date(date); // ensure proper Date object

    // Find user data document
    const userData = await User.findOne({ userId });

    if (!userData) {
      return res.status(404).json({ message: "User data not found" });
    }

    // -- 1. Update menusByDay as before --
    // Check if the day already exists
    const dayEntry = userData.menusByDay.find(day =>
      new Date(day.day).toISOString().split('T')[0] === isoDate.toISOString().split('T')[0]
    );

    if (dayEntry) {
      // Check if item already exists in that day
      const existingItem = dayEntry.menuItems.find(item =>
        item.menuItemId.toString() === menuItemId
      );

      if (existingItem) {
        // Update quantity
        existingItem.quantity += quantity;
      } else {
        // Add new item
        dayEntry.menuItems.push({ menuItemId, quantity });
      }
    } else {
      // Add new day with the menu item
      userData.menusByDay.push({
        day: isoDate,
        menuItems: [{ menuItemId, quantity }]
      });
    }

    // -- 2. Fetch the MenuItem to get its ingredients --
    const menuItem = await MenuItem.findById(menuItemId).lean();
    if (!menuItem || !menuItem.ingredients) {
      return res.status(404).json({ error: "MenuItem or ingredients not found" });
    }

    // Ingredients: [{ name: { ru, en }, amount: { ru, en }, status }]
    const ingredients = menuItem.ingredients;

    // -- 3. Add each ingredient as a separate shopping list entry --
    ingredients.forEach((ingredient) => {
      const ruName = ingredient.name?.ru?.trim();
      const enName = ingredient.name?.en?.trim();
      const ruAmount = ingredient.amount?.ru?.trim();
      const enAmount = ingredient.amount?.en?.trim();

      // Skip if names are missing
      if (!ruName || !enName) return;

      // Check if the ingredient already exists in the shopping list
      const existingEntry = userData.shoppingList.find(entry =>
        entry.ingredient.ru === ruName && entry.ingredient.en === enName
      );

      if (existingEntry) {
        // Simply replace the amount with the latest one
        existingEntry.amount = {
          ru: ruAmount || "",
          en: enAmount || "",
        };
      } else {
        // Add a new shopping list entry
        userData.shoppingList.push({
          meal_id: menuItemId,
          ingredient: {
            ru: ruName,
            en: enName,
          },
          amount: {
            ru: ruAmount || "",
            en: enAmount || "",
          },
          checked: false,
        });
      }
    });


    await userData.save();

    res.status(200).json({
      message: "Menu item added/updated successfully",
      userData,
    });

  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ error: "Server error" });
  }
});



module.exports = router;

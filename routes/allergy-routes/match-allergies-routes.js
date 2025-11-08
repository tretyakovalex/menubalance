const express = require("express");
const User = require("../../models/user");
const { MenuItem } = require("../../models/menuItem");
const { Allergy } = require("../../models/allergy");
const mongoose = require('mongoose');

const stringSimilarity = require("string-similarity");
const authMiddleware = require('../../middleware/authMiddleware');

const router = express.Router();

/**
 * Utility function: normalize strings for better fuzzy matching
 * Handles plurals, punctuation, and casing
 */
function normalizeName(str = "") {
  return str
    .toLowerCase()
    .trim()
    .replace(/ies$/, "y")   // berries -> berry
    .replace(/s$/, "")      // apples -> apple
    .replace(/[^a-zа-яё\s]/gi, ""); // keep spaces for multiword names
}


// router.get("/get-allergy-matches", async (req, res) => {
//   try {
//     // 1️⃣ Get all allergens and expand with examples
//     const allergies = await Allergy.aggregate([
//       { $unwind: "$items" },
//       {
//         $project: {
//           nameEn: { $toLower: "$items.name.en" },
//           nameRu: { $toLower: "$items.name.ru" },
//           examplesEn: { $toLower: "$items.examples.en" },
//           examplesRu: { $toLower: "$items.examples.ru" },
//           allergyType: 1,
//           category: 1
//         }
//       }
//     ]);

//     // Build expanded allergy list (includes names + examples)
//     const expandedAllergens = [];
//     for (const a of allergies) {
//       const base = normalizeName(a.nameEn);
//       expandedAllergens.push({
//         name: base,
//         category: a.category?.en,
//         allergyType: a.allergyType
//       });

//       // Add example words (split by commas)
//       if (a.examplesEn) {
//         const examples = a.examplesEn.split(",").map(e => normalizeName(e));
//         for (const ex of examples) {
//           if (ex) {
//             expandedAllergens.push({
//               name: ex,
//               category: a.category?.en,
//               allergyType: a.allergyType
//             });
//           }
//         }
//       }
//     }

//     const allergyNames = expandedAllergens.map(a => a.name);

//     // 2️⃣ Get all menu items with ingredients
//     const menuItems = await MenuItem.find({}, { name: 1, ingredients: 1 });

//     const results = [];

//     // 3️⃣ Compare each ingredient to allergens using fuzzy matching
//     for (const menu of menuItems) {
//       const itemMatches = [];

//       for (const ingredient of menu.ingredients) {
//         const ingredientName = normalizeName(ingredient?.name?.en);
//         if (!ingredientName) continue;

//         const { ratings } = stringSimilarity.findBestMatch(ingredientName, allergyNames);

//         // Match all allergen candidates above threshold (0.75)
//         const possibleMatches = ratings
//           .filter(r => r.rating > 0.75)
//           .map(r => {
//             const matchedAllergy = expandedAllergens.find(a => a.name === r.target);
//             return {
//               ingredient: ingredient.name.en,
//               possibleAllergen: matchedAllergy?.name,
//               category: matchedAllergy?.category,
//               allergyType: matchedAllergy?.allergyType,
//               similarity: r.rating.toFixed(2)
//             };
//           });

//         if (possibleMatches.length > 0) {
//           itemMatches.push(...possibleMatches);
//         }
//       }

//       // Only include items that have one or more allergen matches
//       if (itemMatches.length > 0) {
//         results.push({
//           menuItemId: menu._id,
//           menuItemName: menu.name?.en || menu.name,
//           matchedAllergens: itemMatches
//         });
//       }
//     }

//     // 4️⃣ Send results
//     res.json({
//       success: true,
//       totalMenuItemsWithAllergens: results.length,
//       results
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Error finding allergy matches",
//       error: err.message
//     });
//   }
// });

router.get("/get-user-allergy-matches", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Fetch user allergies
    const userData = await User.findOne({ userId }).lean();
    if (!userData || !userData.userAllergies?.length) {
      return res.status(200).json({
        success: true,
        message: "No allergies found for this user",
        results: []
      });
    }

    const allergyIds = userData.userAllergies.map(a => new mongoose.Types.ObjectId(a.allergyId));    // 2️⃣ Get only the allergies the user has
    const userAllergies = await Allergy.aggregate([
      { $unwind: "$items" },
      { $match: { "items._id": { $in: allergyIds } } },
      {
        $project: {
          nameEn: { $toLower: "$items.name.en" },
          nameRu: { $toLower: "$items.name.ru" },
          examplesEn: { $toLower: "$items.examples.en" },
          examplesRu: { $toLower: "$items.examples.ru" },
          allergyType: 1,
          category: 1
        }
      }
    ]);

    console.log("Printing userAllergies: ", userAllergies);

    // 3️⃣ Build expanded allergy list (names + examples)
    const expandedAllergens = [];
    for (const a of userAllergies) {
      const base = normalizeName(a.nameEn);
      if (base) {
        expandedAllergens.push({
          name: base,
          category: a.category?.en,
          allergyType: a.allergyType
        });
      }

      if (a.examplesEn) {
        const examples = a.examplesEn.split(",").map(e => normalizeName(e));
        for (const ex of examples) {
          if (ex) {
            expandedAllergens.push({
              name: ex,
              category: a.category?.en,
              allergyType: a.allergyType
            });
          }
        }
      }
    }

    // console.log("Printing expandedAllergens: ", expandedAllergens);
    const allergyNames = expandedAllergens.map(a => a.name);

    // console.log("Printing allergyNames: ", allergyNames);

    // 4️⃣ Get all menu items (you can optionally filter by diet using req.query.diet)
    // const { diet } = req.query;
    const { diet } = "Low-FODMAP";
    const menuQuery = diet ? { diet } : {};
    const menuItems = await MenuItem.find(menuQuery, { title: 1, ingredients: 1 }).lean();

    const results = [];

    // 5️⃣ Compare each ingredient to user’s allergens
    for (const menu of menuItems) {
      const itemMatches = [];
      console.log("\n📋 Processing menu item:", menu.title?.en || menu.title);

      for (const ingredient of menu.ingredients || []) {
        const ingredientName = normalizeName(ingredient?.name?.en || "");
        console.log(" - Ingredient name (normalized):", ingredientName);

        if (!ingredientName) {
          console.log("   ❌ Skipping empty ingredient name");
          continue;
        }

        if (!Array.isArray(allergyNames) || allergyNames.length === 0) {
          console.log("   ❌ No allergy names available to match against");
          continue;
        }

        // ✅ Validate both arguments before comparing
        if (typeof ingredientName !== "string" || allergyNames.some(a => typeof a !== "string")) {
          console.warn("   ⚠️ Skipping invalid ingredient or allergen:", {
            ingredientName,
            allergyNames
          });
          continue;
        }

        const { ratings } = stringSimilarity.findBestMatch(ingredientName, allergyNames);
        console.log("   Ratings:", ratings);

        // Match all allergen candidates above threshold (0.75)
        const possibleMatches = ratings
          .filter(r => r.rating > 0.75)
          .map(r => {
            const matchedAllergy = expandedAllergens.find(a => a.name === r.target);
            return {
              ingredient: ingredient.name?.en || "",
              possibleAllergen: matchedAllergy?.name,
              category: matchedAllergy?.category,
              allergyType: matchedAllergy?.allergyType,
              similarity: r.rating.toFixed(2)
            };
          });

        if (possibleMatches.length > 0) {
          console.log("   ✅ Matches found for ingredient:", possibleMatches);
          itemMatches.push(...possibleMatches);
        } else {
          console.log("   ⚪ No matches found for ingredient");
        }
      }

      if (itemMatches.length > 0) {
        results.push({
          menuItemId: menu._id,
          menuItemName: menu.title?.en || menu.title,
          matchedAllergens: itemMatches
        });
        console.log(" 🟢 Menu item has matches:", menu.title?.en || menu.title);
      } else {
        console.log(" ⚪ Menu item has no allergen matches:", menu.title?.en || menu.title);
      }
    }


    console.log("results: ", results);


    // 6️⃣ Send filtered results
    res.json({
      success: true,
      totalMenuItemsWithAllergens: results.length,
      results
    });

  } catch (err) {
    console.error("❌ Error finding user allergy matches:", err);
    res.status(500).json({
      success: false,
      message: "Error finding user allergy matches",
      error: err.message
    });
  }
});

// router.get("/get-menu-with-allergies", authMiddleware, async (req, res) => {
// router.get("/get-menu-with-allergies", authMiddleware, async (req, res) => {
//   try {
//     const { diet } = req.query;
//     // const userId = req.user.id;
//     const userId = "68e51e34c02e171b5c78e284";

//     // 🧠 Step 1: Fetch user allergies
//     const userData = await User.findOne({ userId }).lean();
//     if (!userData || !userData.userAllergies?.length) {
//       return res.status(200).json({
//         success: true,
//         message: "No allergies found for this user",
//         menuItems: []
//       });
//     }

//     const allergyIds = userData.userAllergies.map(a => a.allergyId);

//     // 🧠 Step 2: Aggregate only the user's selected allergy items
//     const userAllergyDocs = await Allergy.aggregate([
//       { $unwind: "$items" },
//       { $match: { "items._id": { $in: allergyIds } } },
//       {
//         $project: {
//           nameEn: { $toLower: "$items.name.en" },
//           nameRu: { $toLower: "$items.name.ru" },
//           examplesEn: { $toLower: "$items.examples.en" },
//           examplesRu: { $toLower: "$items.examples.ru" },
//           allergyType: 1,
//           category: 1
//         }
//       }
//     ]);

//     // 🧠 Step 3: Build expanded list (names + examples)
//     const expandedAllergens = [];
//     for (const a of userAllergyDocs) {
//       const base = normalizeName(a.nameEn);
//       if (base) {
//         expandedAllergens.push({
//           name: base,
//           category: a.category?.en,
//           allergyType: a.allergyType
//         });
//       }

//       if (a.examplesEn) {
//         const examples = a.examplesEn.split(",").map(e => normalizeName(e));
//         for (const ex of examples) {
//           if (ex) {
//             expandedAllergens.push({
//               name: ex,
//               category: a.category?.en,
//               allergyType: a.allergyType
//             });
//           }
//         }
//       }
//     }

//     const allergyNames = expandedAllergens.map(a => a.name);

//     // 🧠 Step 4: Fetch all menu items for the user's diet
//     const menuItems = await MenuItem.find({ diet }).lean();

//     // 🧠 Step 5: Compare each ingredient in each menu item to allergens
//     const results = menuItems.map(menu => {
//       const updatedIngredients = (menu.ingredients || []).map(ingredient => {
//         const ingredientName = normalizeName(ingredient?.name?.en);
//         if (!ingredientName) return { ...ingredient, hasAllergy: false, similarity: null };

//         const { ratings } = stringSimilarity.findBestMatch(ingredientName, allergyNames);

//         // Find best match
//         const bestMatch = ratings.reduce(
//           (best, current) => (current.rating > best.rating ? current : best),
//           { rating: 0 }
//         );

//         const matchedAllergy = expandedAllergens.find(a => a.name === bestMatch.target);
//         const hasAllergy = bestMatch.rating > 0.75; // threshold

//         return {
//           ...ingredient,
//           hasAllergy,
//           matchedAllergy: hasAllergy ? matchedAllergy?.name : null,
//           category: hasAllergy ? matchedAllergy?.category : null,
//           allergyType: hasAllergy ? matchedAllergy?.allergyType : null,
//           similarity: hasAllergy ? bestMatch.rating.toFixed(2) : null
//         };
//       });

//       return {
//         ...menu,
//         ingredients: updatedIngredients
//       };
//     });

//     res.status(200).json({
//       success: true,
//       diet,
//       totalItems: results.length,
//       results
//     });

//   } catch (error) {
//     console.error("Error fetching menu with allergy details:", error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// });

module.exports = router;
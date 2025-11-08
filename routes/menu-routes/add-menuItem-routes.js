// routes/menu.js
const express = require("express");
const authMiddleware = require('../../middleware/authMiddleware'); // JWT auth middleware (optional)
const { MenuItem } = require("../../models/menuItem");
const router = express.Router();


// router.post("/add-menuItem", authMiddleware, async (req, res) => {
router.post("/add-menuItem", async (req, res) => {
  try {
    const data = req.body;

    // ✅ Validate required fields
    if (!data || !data.title || !data.diet) {
      return res.status(400).json({ error: "diet and title are required" });
    }

    console.log("Received menu item data:", data);

    // ✅ Normalize ingredients
    const normalizeIngredients = (ruList, enList) => {
      const ingredients = [];
      const maxLength = Math.max(ruList?.length || 0, enList?.length || 0);

      for (let i = 0; i < maxLength; i++) {
        const ru = ruList?.[i];
        const en = enList?.[i];

        if (!ru || !en) continue;

        if (typeof ru === 'string' && typeof en === 'string') {
          ingredients.push({
            name: { ru, en },
          });
        } else if (
          typeof ru === 'object' &&
          typeof en === 'object' &&
          ru.name &&
          en.name
        ) {
          ingredients.push({
            name: {
              ru: ru.name,
              en: en.name,
            },
            status: ru.status || en.status || undefined,
          });
        }
      }

      return ingredients;
    };

    const ingredients = normalizeIngredients(data.ingredients?.ru, data.ingredients?.en);

    // ✅ Normalize recipe
    const recipe = {
      ru: Array.isArray(data.recipe?.ru) ? data.recipe.ru : [],
      en: Array.isArray(data.recipe?.en) ? data.recipe.en : []
    };

    // ✅ Normalize variations
    const variations = Array.isArray(data.variations) ? data.variations : [];

    // ✅ Normalize subRecipes
    const normalizeSubRecipes = (subRecipes = []) => {
      return subRecipes
        .filter(r => r?.title?.ru && r?.title?.en)
        .map(r => ({
          title: {
            ru: r.title.ru,
            en: r.title.en
          },
          description: r.description || { ru: "", en: "" },
          ingredients: normalizeIngredients(r.ingredients?.ru, r.ingredients?.en),
          recipe: {
            ru: Array.isArray(r.recipe?.ru) ? r.recipe.ru : [],
            en: Array.isArray(r.recipe?.en) ? r.recipe.en : []
          },
          calories: r.calories || 0,
          proteins: r.proteins || 0,
          fats: r.fats || 0,
          carbohydrates: r.carbohydrates || 0
        }));
    };

    const subRecipes = normalizeSubRecipes(data.subRecipes);

    // ✅ Normalize gradualIntroduction
    const normalizeGradualIntroduction = (items = []) => {
      return items
        .filter(item => item?.ingredient?.ru && item?.ingredient?.en)
        .map(item => ({
          ingredient: {
            ru: item.ingredient.ru,
            en: item.ingredient.en
          },
          steps: Array.isArray(item.steps)
            ? item.steps.map(step => ({
                day: step.day,
                amount: {
                  ru: step.amount?.ru || "",
                  en: step.amount?.en || ""
                },
                instruction: {
                  ru: step.instruction?.ru || "",
                  en: step.instruction?.en || ""
                }
              }))
            : [],
          note: {
            ru: item.note?.ru || "",
            en: item.note?.en || ""
          }
        }));
    };

    const gradualIntroduction = normalizeGradualIntroduction(data.gradualIntroduction);

    // ✅ Construct new MenuItem document
    const menuItem = new MenuItem({
      diet: data.diet,
      title: data.title,
      description: data.description || { ru: "", en: "" },
      image: data.image || "",
      additionalImages: Array.isArray(data.additionalImages) ? data.additionalImages : data.additionalImages ? [data.additionalImages] : [],
      ingredients,
      recipe,
      categories: data.categories || { ru: "", en: "" },
      nutritionInfo: {
        ru: data.nutritionInfo?.ru || "",
        en: data.nutritionInfo?.en || ""
      },
      calories: data.calories || 0,
      proteins: data.proteins || 0,
      fats: data.fats || 0,
      carbohydrates: data.carbohydrates || 0,
      variations,
      subRecipes,
      gradualIntroduction
    });

    // ✅ Save to database
    await menuItem.save();

    res.status(201).json({
      message: "Menu item added successfully",
      menuItem
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Add a new MenuItem
// router.post("/add-menuItem", authMiddleware, async (req, res) => {
//   try {
//     const data = req.body;

//     // Validate required fields
//     if (!data || !data.title || !data.diet) {
//       return res.status(400).json({ error: "diet and title are required" });
//     }

//     console.log("Printing data: ", data);

//     // Ensure ingredients and recipe are objects with ru/en arrays
//     const ingredients = {
//       ru: Array.isArray(data.ingredients?.ru) ? data.ingredients.ru : [],
//       en: Array.isArray(data.ingredients?.en) ? data.ingredients.en : [],
//     };

//     const recipe = {
//       ru: Array.isArray(data.recipe?.ru) ? data.recipe.ru : [],
//       en: Array.isArray(data.recipe?.en) ? data.recipe.en : [],
//     };
    
//     const variations = Array.isArray(data.variations) ? data.variations : [];

//     // 1. Create a new MenuItem
//     const menuItem = new MenuItem({
//       diet: data.diet,
//       title: data.title,           // { ru: "...", en: "..." }
//       description: data.description || { ru: "", en: "" },
//       image: data.image || "",
//       ingredients,
//       recipe,
//       categories: data.categories, // { ru: "...", en: "..." }
//       calories: data.calories || 0,
//       proteins: data.proteins || 0,
//       fats: data.fats || 0,
//       carbohydrates: data.carbohydrates || 0,
//       variations                  // optional variations
//     });

//     await menuItem.save();

//     res.status(201).json({
//       message: "MenuItem added successfully",
//       menuItem,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;
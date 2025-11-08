// routes/menu.js
const express = require("express");
const { MenuItem } = require("../../models/menuItem");
const router = express.Router();

router.put("/gradualIngredients", async (req, res) => {
  try {
    // Fetch menu items where gradualIntroduction exists and is non-empty
    const menuItems = await MenuItem.find({
      gradualIntroduction: { $exists: true, $not: { $size: 0 } }
    }).select("gradualIntroduction"); // Only fetch gradualIntroduction field

    const gradualIntro = {
      "Avocado": [
        { day: "day1", amount: { en: "30g", ru: "30г" }, en: "Start with a small portion of avocado (30g) to test tolerance.", ru: "Начните с небольшой порции авокадо (30г) для проверки переносимости." },
        { day: "day2", amount: { en: "45g", ru: "45г" }, en: "If no symptoms occur, increase the portion to half of the fruit (45g).", ru: "Если нет симптомов, увеличьте порцию до половины фрукта (45г)." },
        { day: "day3", amount: { en: "80g", ru: "80г" }, en: "On the third day, you can use the whole avocado (80g).", ru: "На третий день используйте весь авокадо (80г)." }
      ],
      "Onion": [
        { day: "day1", amount: { en: "12g", ru: "12г" }, en: "Start with a small portion of onion (12g).", ru: "Начните с небольшой порции лука (12г)." },
        { day: "day2", amount: { en: "50g", ru: "50г" }, en: "If tolerated, increase to 50g.", ru: "Если переносимо, увеличьте до 50г." },
        { day: "day3", amount: { en: "75g", ru: "75г" }, en: "Use full portion (75g).", ru: "Используйте полную порцию (75г)." }
      ],
      "Apple": [
        { day: "day1", amount: { en: "25g", ru: "25г" }, en: "Start with a small portion of apple (25g).", ru: "Начните с небольшой порции яблока (25г)." },
        { day: "day2", amount: { en: "30g", ru: "30г" }, en: "Increase portion to 30g.", ru: "Увеличьте порцию до 30г." },
        { day: "day3", amount: { en: "165g", ru: "165г" }, en: "Use full portion (165g).", ru: "Используйте полную порцию (165г)." }
      ],
      "Garlic": [
        { day: "day1", amount: { en: "0g", ru: "0г" }, en: "Introduce only after other foods are tolerated.", ru: "Вводится после других продуктов." }
      ],
      "Vinegar": [
        { day: "day1", amount: { en: "21ml", ru: "21мл" }, en: "Start with a small portion of vinegar (21ml).", ru: "Начните с небольшой порции уксуса (21мл)." },
        { day: "day2", amount: { en: "31.5ml", ru: "31,5мл" }, en: "Increase portion to 31.5ml.", ru: "Увеличьте порцию до 31,5мл." },
        { day: "day3", amount: { en: "42ml", ru: "42мл" }, en: "Use full portion (42ml).", ru: "Используйте полную порцию (42мл)." }
      ],
      "Sour cream": [
        { day: "day1", amount: { en: "40g", ru: "40г" }, en: "Start with a small portion of sour cream (40g).", ru: "Начните с небольшой порции сметаны (40г)." },
        { day: "day2", amount: { en: "80g", ru: "80г" }, en: "Increase portion to 80g.", ru: "Увеличьте порцию до 80г." },
        { day: "day3", amount: { en: "150g", ru: "150г" }, en: "Use full portion (150g).", ru: "Используйте полную порцию (150г)." }
      ],
      "Yogurt": [
        { day: "day1", amount: { en: "20g", ru: "20г" }, en: "Start with a small portion of yogurt (20g).", ru: "Начните с небольшой порции йогурта (20г)." },
        { day: "day2", amount: { en: "60g", ru: "60г" }, en: "Increase portion to 60g.", ru: "Увеличьте порцию до 60г." },
        { day: "day3", amount: { en: "170g", ru: "170г" }, en: "Use full portion (170g).", ru: "Используйте полную порцию (170г)." }
      ],
      "Hummus": [
        { day: "day1", amount: { en: "42g", ru: "42г" }, en: "Start with a small portion of hummus (42g).", ru: "Начните с небольшой порции хумуса (42г)." },
        { day: "day2", amount: { en: "63g", ru: "63г" }, en: "Increase portion to 63g.", ru: "Увеличьте порцию до 63г." },
        { day: "day3", amount: { en: "84g", ru: "84г" }, en: "Use full portion (84g).", ru: "Используйте полную порцию (84г)." }
      ],
      "Pear": [
        { day: "day1", amount: { en: "5g", ru: "5г" }, en: "Start with a small portion of pear (5g).", ru: "Начните с небольшой порции груши (5г)." },
        { day: "day2", amount: { en: "10g", ru: "10г" }, en: "Increase portion to 10g.", ru: "Увеличьте порцию до 10г." },
        { day: "day3", amount: { en: "170g", ru: "170г" }, en: "Use full portion (170g).", ru: "Используйте полную порцию (170г)." }
      ],
      "Cauliflower": [
        { day: "day1", amount: { en: "0g", ru: "0г" }, en: "Introduce only after other foods are tolerated.", ru: "Вводится после других продуктов." }
      ],
      "Cottage cheese": [
        { day: "day1", amount: { en: "40g", ru: "40г" }, en: "Start with a small portion of cottage cheese (40g).", ru: "Начните с небольшой порции творога (40г)." },
        { day: "day2", amount: { en: "60g", ru: "60г" }, en: "Increase portion to 60g.", ru: "Увеличьте порцию до 60г." },
        { day: "day3", amount: { en: "180g", ru: "180г" }, en: "Use full portion (180g).", ru: "Используйте полную порцию (180г)." }
      ],
      "Honey": [
        { day: "day1", amount: { en: "7g", ru: "7г" }, en: "Start with a small portion of honey (7g).", ru: "Начните с небольшой порции меда (7г)." },
        { day: "day2", amount: { en: "14g", ru: "14г" }, en: "Increase portion to 14g.", ru: "Увеличьте порцию до 14г." },
        { day: "day3", amount: { en: "28g", ru: "28г" }, en: "Use full portion (28g).", ru: "Используйте полную порцию (28г)." }
      ],
      "Milk": [
        { day: "day1", amount: { en: "20ml", ru: "20мл" }, en: "Start with a small portion of milk (20ml).", ru: "Начните с небольшой порции молока (20мл)." },
        { day: "day2", amount: { en: "60ml", ru: "60мл" }, en: "Increase portion to 60ml.", ru: "Увеличьте порцию до 60мл." },
        { day: "day3", amount: { en: "257ml", ru: "257мл" }, en: "Use full portion (257ml).", ru: "Используйте полную порцию (257мл)." }
      ],
      "Persimmon": [
        { day: "day1", amount: { en: "60g", ru: "60г" }, en: "Start with a small portion of persimmon (60g).", ru: "Начните с небольшой порции хурмы (60г)." },
        { day: "day2", amount: { en: "65g", ru: "65г" }, en: "Increase portion to 65g.", ru: "Увеличьте порцию до 65г." },
        { day: "day3", amount: { en: "75g", ru: "75г" }, en: "Use full portion (75g).", ru: "Используйте полную порцию (75г)." }
      ],
      "Pomegranate": [
        { day: "day1", amount: { en: "45g", ru: "45г" }, en: "Start with a small portion of pomegranate (45g).", ru: "Начните с небольшой порции граната (45г)." },
        { day: "day2", amount: { en: "55g", ru: "55г" }, en: "Increase portion to 55g.", ru: "Увеличьте порцию до 55г." },
        { day: "day3", amount: { en: "87g", ru: "87г" }, en: "Use full portion (87g).", ru: "Используйте полную порцию (87г)." }
      ],
      "Raspberry": [
        { day: "day1", amount: { en: "60g", ru: "60г" }, en: "Start with a small portion of raspberries (60g).", ru: "Начните с небольшой порции малины (60г)." },
        { day: "day2", amount: { en: "65g", ru: "65г" }, en: "Increase portion to 65g.", ru: "Увеличьте порцию до 65г." },
        { day: "day3", amount: { en: "135g", ru: "135г" }, en: "Use full portion (135g).", ru: "Используйте полную порцию (135г)." }
      ],
      "Mango": [
        { day: "day1", amount: { en: "40g", ru: "40г" }, en: "Start with a small portion of mango (40g).", ru: "Начните с небольшой порции манго (40г)." },
        { day: "day2", amount: { en: "45g", ru: "45г" }, en: "Increase portion to 45g.", ru: "Увеличьте порцию до 45г." },
        { day: "day3", amount: { en: "140g", ru: "140г" }, en: "Use full portion (140g).", ru: "Используйте полную порцию (140г)." }
      ],
      "Dried Mango": [
        { day: "day1", amount: { en: "0g", ru: "0г" }, en: "Introduce only after other foods are tolerated.", ru: "Вводится после других продуктов." }
      ],
      "Peach": [
        { day: "day1", amount: { en: "25g", ru: "25г" }, en: "Start with a small portion of peach (25g).", ru: "Начните с небольшой порции персика (25г)." },
        { day: "day2", amount: { en: "145g", ru: "145г" }, en: "Increase portion to 145g.", ru: "Увеличьте порцию до 145г." },
        { day: "day3", amount: { en: "as tolerated", ru: "по переносимости" }, en: "Use full portion as tolerated.", ru: "Используйте полную порцию по переносимости." }
      ],
      "Dates": [
        { day: "day1", amount: { en: "8g", ru: "8г" }, en: "Start with a small portion of dates (8g).", ru: "Начните с небольшой порции фиников (8г)." },
        { day: "day2", amount: { en: "10g", ru: "10г" }, en: "Increase portion to 10g.", ru: "Увеличьте порцию до 10г." },
        { day: "day3", amount: { en: "30g", ru: "30г" }, en: "Use full portion (30g).", ru: "Используйте полную порцию (30г)." }
      ],
      "Prunes": [
        { day: "day1", amount: { en: "0g", ru: "0г" }, en: "Introduce only after other foods are tolerated.", ru: "Вводится после других продуктов." }
      ]
    };

    let updatedCount = 0;

    const updatedItems = [];

    for (const item of menuItems) {
      if (!item.gradualIntroduction?.length) continue;

      const updatedGradualIntroduction = item.gradualIntroduction.map(gradual => {
        const ingredientName = gradual.ingredient?.en;
        const introSteps = gradualIntro[ingredientName];
        if (!introSteps) return gradual;

        const steps = introSteps.map(step => ({
          day: parseInt(step.day.replace('day', ''), 10) || 0,
          amount: {
            en: step.amount.en || "",
            ru: step.amount.ru || ""
          },
          instruction: {
            en: step.en,
            ru: step.ru
          }
        }));

        const updatedGradual = { ...gradual, steps };

        // If it’s a single-step intro that’s essentially a note (e.g. "0g" or "Introduce later")
        if (introSteps.length === 1) {
          updatedGradual.note = {
            en: introSteps[0].en,
            ru: introSteps[0].ru
          };
          updatedGradual.steps = [];
        }

        updatedCount++;
        return updatedGradual;
      });

      // Update document in DB
      await MenuItem.updateOne(
        { _id: item._id },
        { $set: { gradualIntroduction: updatedGradualIntroduction } }
      );

      updatedItems.push({
        _id: item._id,
        gradualIntroduction: updatedGradualIntroduction
      });
    }

    res.status(200).json({
      message: `Updated ${updatedCount} gradual introductions successfully.`,
      updatedItems
    });


  } catch (error) {
    console.error("Error fetching gradualIntroduction ingredients:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

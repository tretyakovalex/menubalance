const express = require("express");
const { DietFoodAlternative } = require("../../models/dietFoodAlternative");
const router = express.Router();

router.post("/add-diet-food-alternative", async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    // ✅ Validate required fields
    if (
      !data ||
      !data.category ||
      !data.category.ru ||
      !data.group ||
      !data.dietType
    ) {
      return res.status(400).json({
        error: "category.ru, group, and dietType are required fields."
      });
    }

    console.log("Received DietFoodAlternative data:", data);

    // ✅ Construct new DietFoodAlternative document using request data
    const dietFoodAlternative = new DietFoodAlternative({
      dietType: data.dietType,
      group: data.group,
      category: {
        ru: data.category.ru,
        en: data.category.en || ""
      },
      items: data.items || [], // expects array of { name: { ru, en }, portion, image }
      notes: data.notes || "",
      image: data.image || ""
    });

    // ✅ Save to database
    await dietFoodAlternative.save();

    res.status(201).json({
      message: "Diet food alternative added successfully",
      dietFoodAlternative
    });
  } catch (error) {
    console.error("Error adding diet food alternative:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

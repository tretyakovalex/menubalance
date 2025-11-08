const express = require("express");
const { Allergy } = require("../../models/allergy");
const router = express.Router();

router.post("/add-allergy", async (req, res) => {
  try {
    const data = req.body;

    console.log("Received allergy data:", data);

    // ✅ Validate required fields
    if (
      !data ||
      !data.category ||
      !data.category.ru ||
      !data.group ||
      !data.allergyType
    ) {
      return res.status(400).json({
        error: "category.ru, group, and allergyType are required fields."
      });
    }

    // ✅ Construct new Allergy document
    const allergy = new Allergy({
      allergyType: data.allergyType, // e.g., "General Allergens"
      group: data.group, // e.g., "Allergens"
      category: {
        ru: data.category.ru,
        en: data.category.en || ""
      },
      items: data.items || [], // expects array of { name: { ru, en }, examples: { ru, en } }
      notes: data.notes || { ru: "", en: "" },
      image: data.image || ""
    });

    // ✅ Save to database
    await allergy.save();

    res.status(201).json({
      message: "Allergy added successfully",
      allergy
    });
  } catch (error) {
    console.error("Error adding allergy:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const { Fruit } = require("../../models/fruits");
const router = express.Router();

router.post("/add-fruit", async (req, res) => {
  try {
    const data = req.body;

    // ✅ Validate required fields
    if (
      !data ||
      !data.name ||
      !data.name.ru ||
      !data.name.en ||
      !data.image ||
      !data.allowedPerDayGrams
    ) {
      return res.status(400).json({
        error: "name.ru, name.en, image, and allowedPerDayGrams are required"
      });
    }

    console.log("Received fruit data:", data);

    // ✅ Construct new Fruit document using request data
    const fruit = new Fruit({
      name: {
        ru: data.name.ru,
        en: data.name.en,
      },
      image: data.image,
      allowedPerDayGrams: data.allowedPerDayGrams,
      diet: data.diet || "Low-FODMAP", // default if not provided
    });

    // ✅ Save to database
    await fruit.save();

    res.status(201).json({
      message: "Fruit added successfully",
      fruit,
    });
  } catch (error) {
    console.error("Error adding fruit:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

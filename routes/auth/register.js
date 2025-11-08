const express = require("express");
const passport = require("passport");
const UserAuth = require("../../models/userAuth");
const bcrypt = require("bcryptjs");
const router = express.Router();

const { createUserData } = require('../../services/userDataService');

// Register Route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const existingUser = await UserAuth.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username taken" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserAuth({ username, email, password: hashedPassword });
    await newUser.save();

    // ✅ Create corresponding UserData document
    try {
      await createUserData(newUser._id);
    } catch (err) {
      console.error("UserData creation failed:", err.message);
      // Optional: Handle or report error if needed
    }

    res.json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/check-username", async (req, res) => {
    const { username } = req.query; // Get the username from the query params

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }

    const existingUser = await UserAuth.findOne({ username: username });

    if (existingUser) {
        return res.status(409).json({ message: "Username already taken" });
    }

    res.status(200).json({ message: "Username available" });
});

router.get("/check-email", async (req, res) => {
    const { email } = req.query; // Get the username from the query params

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await UserAuth.findOne({ email: email });

    if (existingUser) {
        return res.status(409).json({ message: "Email already taken" });
    }

    res.status(200).json({ message: "Email available" });
});

module.exports = router;
const express = require("express");
const router = express.Router();
const UserAuth = require("../../models/userAuth");
const authMiddleware = require("../../middleware/authMiddleware");
const jwt = require("jsonwebtoken");

router.get("/refresh", authMiddleware, async (req, res) => {
  try {
    // `req.user` comes from authMiddleware
    const user = await UserAuth.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Issue new token with updated hasPaid
    const newToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, hasPaid: true },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token: newToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
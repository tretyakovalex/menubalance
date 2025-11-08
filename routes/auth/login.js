const express = require("express");
const passport = require("passport");
const UserAuth = require("../../models/userAuth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Login Route (Passport.js Local Strategy)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: info.message || "Username or password is incorrect" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, hasPaid: user.hasPaid },
      process.env.JWT_SECRET,
      { expiresIn: "24h" } // Token expires in 1 hour
    );

    res.json({ message: `Welcome ${user.username}, you are logged in!`, token });
  })(req, res, next);
});

// Logout Route
router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
      if (err) return next(err);
      req.session.destroy(() => {
        res.clearCookie("connect.sid"); // Clears session cookie
        res.json({ message: "Logged out successfully" });
      });
    });
});

module.exports = router;
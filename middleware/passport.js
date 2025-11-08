const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const UserAuth = require("../models/userAuth");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

// Local Strategy for Login (Using Username & Password)
passport.use(
  new LocalStrategy(
    { usernameField: "username" }, 
    async (username, password, done) => {
      try {
        // Find user by username
        const user = await UserAuth.findOne({ username });
        if (!user) return done(null, false, { message: "Username or password is incorrect" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return done(null, false, { message: "Username or password is incorrect" });

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

module.exports = passport;
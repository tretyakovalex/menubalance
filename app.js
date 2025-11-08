const express = require('express');
const app = express();
const cors = require('cors')
const path = require('path');
const bodyParser = require('body-parser');
const session = require("express-session");

const connectMongoDB = require('./configs/mongodb.js');
const passport = require("./middleware/passport.js"); // Import Passport.js

const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectMongoDB(); // Connect to mongodb once when you start the server

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// Express session
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// Initialize Passport.js
app.use(passport.initialize());

// === Auth Routes ===
app.use(require('./routes/auth/refresh.js'));
app.use(require('./routes/auth/login.js'));
app.use(require('./routes/auth/register.js'));

// === Menu Routes ===
app.use(require('./routes/menu-routes/get-menuItem-routes.js'));
app.use(require('./routes/menu-routes/add-menuItem-routes.js'));
app.use(require('./routes/menu-routes/mongodb-gradualIntro-update-script.js')); // Temporary
// ===================

// === User Routes ===
app.use(require('./routes/user/user-routes.js'));
app.use(require('./routes/user/meal-diary-routes.js'));
app.use(require('./routes/user/get-user-allergies-routes.js'));
app.use(require('./routes/user/modify-user-allergies-routes.js'));
// ===================

// === Food Allergy Routes ===
app.use(require('./routes/allergy-routes/add-allergy.js'));
app.use(require('./routes/allergy-routes/get-allergies.js'));
app.use(require('./routes/allergy-routes/match-allergies-routes.js'));
// ====================================

// === Food Diet Alternative Routes ===
app.use(require('./routes/diet-food-alternative-routes/add-diet-food-alternatives.js'));
app.use(require('./routes/diet-food-alternative-routes/get-diet-food-alternatives.js'));
// ====================================

// === Frontend: ===
app.use(express.static(path.join(__dirname, 'public', 'browser')));
app.get('*angular', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'browser', 'index.html'))
})
// =================

// app.listen(PORT, '192.168.1.40', () => {
app.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});
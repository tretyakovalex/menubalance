const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const menuItemSchema = new Schema({
  menuItemId: { type: Types.ObjectId, ref: 'MenuItem', required: true },
  quantity: { type: Number, default: 1 },
}, { _id: false });

const dayMenuSchema = new Schema({
  day: { type: Date, required: true }, // now stores full ISO date like "2025-10-03T00:00:00.000Z"
  menuItems: [menuItemSchema]
}, { _id: false });

const list = new Schema({
  meal_id: { type: Types.ObjectId, ref: 'MenuItem', required: true },
  ingredient: {
      ru: { type: String },
      en: { type: String },
  },
  amount: {
      ru: { type: String },
      en: { type: String },
  },
  checked: {type: Boolean, required: true, default: false}
});

const mealDiarySchema = new Schema({
  mealDiaryId: { type: Types.ObjectId },
  dayIntroduced: { type: String },
  mealTime: { type: String },
  introducedProduct: { type: String },
  reactionObserved: { type: Boolean, required: true },
  reactionType: { type: String },
  severity: { type: Number, min: 0, max: 5 },
  notes: { type: String }
});

// Each allergy selected by the user
const userAllergySchema = new Schema({
  allergyId: { type: String },
  checked: { type: Boolean, default: true },
  name: {
    ru: { type: String, required: true },
    en: { type: String, required: true }
  }
}, { _id: false });

// Main user data schema
const userDataSchema = new Schema({
  userId: { type: Types.ObjectId, ref: 'UserAuth', required: true, unique: true },
  menusByDay: [dayMenuSchema], // your existing schema
  shoppingList: [list],        // your existing schema
  mealDiary: [mealDiarySchema],// your existing schema
  userAllergies: [userAllergySchema]
}, { timestamps: true });

module.exports = mongoose.model('UserData', userDataSchema);

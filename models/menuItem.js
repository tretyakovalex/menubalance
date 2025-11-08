import { Schema, model } from 'mongoose';

const gradualStepSchema = new Schema({
  day: { type: Number, required: true },
  amount: {
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  instruction: {
    ru: { type: String, required: true },
    en: { type: String, required: true }
  }
}, { _id: false });

const gradualIntroductionSchema = new Schema({
  ingredient: {
    ru: { type: String, required: true },
    en: { type: String, required: true }
  },
  steps: [gradualStepSchema],
  note: {
    ru: { type: String },
    en: { type: String }
  }
}, { _id: false });

const variationSchema = new Schema({
    description: {
        ru: { type: String },
        en: { type: String },
    },
    calories: { type: Number },
    proteins: { type: Number },
    fats: { type: Number },
    carbohydrates: { type: Number },
}, { _id: false });

const ingredientSchema = new Schema({
  name: {
    ru: { type: String, default: "" }, // instead of required
    en: { type: String, default: "" }
  },
  amount: {
    ru: { type: String, default: "" }, // new field for manual entry
    en: { type: String, default: "" }
  },
  status: {
    type: String,
    enum: ['allowed', 'moderate', 'avoid'],
    required: false
  }
}, { _id: false });


const subRecipeSchema = new Schema({
  title: {
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ru: { type: String },
    en: { type: String },
  },
  ingredients: [ingredientSchema],
  recipe: {
    ru: [{ type: String }],
    en: [{ type: String }],
  },
  calories: { type: Number },
  proteins: { type: Number },
  fats: { type: Number },
  carbohydrates: { type: Number },
}, { _id: false });

const menuItemSchema = new Schema({
    diet: { type: String, required: true },
    title: {
        ru: { type: String, required: true },
        en: { type: String, required: true },
    },
    description: {
        ru: { type: String },
        en: { type: String },
    },
    image: { type: String },
    additionalImages: [{ type: String }],
    ingredients: [ingredientSchema],
    recipe: {
        ru: [{ type: String }],
        en: [{ type: String }],
    },
    categories: {
        ru: { type: String },
        en: { type: String },
    },
    nutritionInfo: {
        ru: { type: String },
        en: { type: String },
    },
    calories: { type: Number },
    proteins: { type: Number },
    fats: { type: Number },
    carbohydrates: { type: Number },
    variations: [variationSchema], // optional array of variations
    subRecipes: [subRecipeSchema], // optional array of sub-recipes
    gradualIntroduction: [gradualIntroductionSchema]
}, { timestamps: true });

export const MenuItem = model('MenuItem', menuItemSchema);
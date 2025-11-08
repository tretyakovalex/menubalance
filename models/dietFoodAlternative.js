import { Schema, model } from 'mongoose';

const foodItemSchema = new Schema({
  name: {
    ru: { type: String, required: true },
    en: { type: String }
  },
  portion: { type: String },
  image: { type: String }
});

const dietFoodAlternativeSchema = new Schema({
  dietType: { type: String, required: true }, // e.g. "Low-FODMAP", "Keto", "Vegan"
  group: { type: String, required: true }, // e.g. "Молочные продукты", "Хлеб и мука"
  category: {
    ru: { type: String, required: true },
    en: { type: String }
  },
  items: [foodItemSchema],
  notes: { type: String }, // optional field for explanations or tips
  image: { type: String } // optional category/group image
});

export const DietFoodAlternative = model('DietFoodAlternative', dietFoodAlternativeSchema);


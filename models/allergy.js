import { Schema, model } from 'mongoose';

const allergyItemSchema = new Schema({
  name: {
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  examples: {
    ru: { type: String },
    en: { type: String },
  }
});

const allergySchema = new Schema({
  allergyType: { type: String, required: true }, // e.g., "General Allergens"
  group: { type: String, required: true }, // e.g., "Allergens"
  category: {
    ru: { type: String, required: true },
    en: { type: String, required: true },
  },
  items: { type: [allergyItemSchema], default: [] }, // list of allergenic items
  notes: {
    ru: { type: String },
    en: { type: String },
  },
  image: { type: String } // optional, if you want to associate an image
}, { timestamps: true });

export const Allergy = model('Allergy', allergySchema);

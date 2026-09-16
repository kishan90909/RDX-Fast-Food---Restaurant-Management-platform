import mongoose from 'mongoose'

const menuItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true, index: true },
  price: { type: Number, required: true, min: 0 },
  priceLabel: { type: String, default: '' },
  available: { type: Boolean, default: true, index: true },
  bestseller: { type: Boolean, default: false },
  special: { type: Boolean, default: false },
  dietType: { type: String, enum: ['Veg', 'Non-Veg'], required: true, index: true }
}, { timestamps: true })

export default mongoose.model('MenuItem', menuItemSchema)

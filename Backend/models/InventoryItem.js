import mongoose from 'mongoose'

const inventoryItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true, index: true },
  category: { type: String, required: true, trim: true, index: true },
  name: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, min: 0, default: 20 },
  lowStockThreshold: { type: Number, required: true, min: 0, default: 5 },
  unit: { type: String, trim: true, default: 'items' },
}, { timestamps: true })

export default mongoose.model('InventoryItem', inventoryItemSchema)

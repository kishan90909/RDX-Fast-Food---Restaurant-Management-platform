import mongoose from 'mongoose'

const favoriteSchema = new mongoose.Schema({
  customerKey: { type: String, required: true, index: true },
  itemId: { type: String, required: true, index: true }
}, { timestamps: true })
favoriteSchema.index({ customerKey: 1, itemId: 1 }, { unique: true })
export default mongoose.model('Favorite', favoriteSchema)

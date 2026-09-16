import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: null, min: 0 },
  minOrder: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true, index: true },
  startsAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null }
}, { timestamps: true })

export default mongoose.model('Offer', offerSchema)

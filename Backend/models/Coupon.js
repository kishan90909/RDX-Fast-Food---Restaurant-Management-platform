import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, index: true, uppercase: true, trim: true },
  type: { type: String, enum: ['percent', 'flat'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: { type: Number, default: null, min: 0 },
  minOrder: { type: Number, default: 0, min: 0 },
  active: { type: Boolean, default: true, index: true },
  startsAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  usageLimit: { type: Number, default: null, min: 1 },
  usedCount: { type: Number, default: 0, min: 0 },
  perUserLimit: { type: Number, default: 1, min: 1 },
  label: { type: String, default: '' }
}, { timestamps: true })

export default mongoose.model('Coupon', couponSchema)

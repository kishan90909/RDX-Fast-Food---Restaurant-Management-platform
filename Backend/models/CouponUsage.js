import mongoose from 'mongoose'

const couponUsageSchema = new mongoose.Schema({
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', required: true, index: true },
  couponCode: { type: String, required: true, uppercase: true, trim: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, required: true, index: true },
  discount: { type: Number, required: true, min: 0 }
}, { timestamps: true })

couponUsageSchema.index({ couponId: 1, userId: 1 }, { unique: true })
export default mongoose.model('CouponUsage', couponUsageSchema)

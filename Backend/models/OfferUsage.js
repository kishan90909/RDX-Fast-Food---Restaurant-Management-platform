import mongoose from 'mongoose'

const offerUsageSchema = new mongoose.Schema({
  offerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Offer', required: true, index: true },
  offerCode: { type: String, required: true, uppercase: true, trim: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  orderId: { type: String, required: true, index: true },
  discount: { type: Number, required: true, min: 0 }
}, { timestamps: true })

offerUsageSchema.index({ offerId: 1, userId: 1 }, { unique: true })

export default mongoose.model('OfferUsage', offerUsageSchema)

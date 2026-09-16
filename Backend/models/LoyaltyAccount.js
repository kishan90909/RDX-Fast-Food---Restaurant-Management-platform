import mongoose from 'mongoose'

const historySchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, enum: ['earned', 'redeemed'], required: true },
  points: { type: Number, required: true, min: 0 },
  amount: { type: Number, default: 0, min: 0 },
  orderId: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { _id: false })

const loyaltySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  points: { type: Number, default: 0, min: 0 },
  lifetimePoints: { type: Number, default: 0, min: 0 },
  redeemedPoints: { type: Number, default: 0, min: 0 },
  history: { type: [historySchema], default: [] },
}, { timestamps: true })

export default mongoose.model('LoyaltyAccount', loyaltySchema)

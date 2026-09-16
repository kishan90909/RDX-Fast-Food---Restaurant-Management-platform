import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { type: String, enum: ['order', 'tracking', 'promotion', 'info'], default: 'info', index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 500 },
  orderId: { type: String, default: '', trim: true, index: true },
  read: { type: Boolean, default: false, index: true },
}, { timestamps: true })

notificationSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Notification', notificationSchema)

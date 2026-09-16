import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  category: { type: String, default: '' },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 }
}, { _id: false })

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  customerKey: { type: String, required: true, index: true },
  customerEmail: { type: String, trim: true, lowercase: true, index: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  items: { type: [orderItemSchema], required: true, validate: v => Array.isArray(v) && v.length > 0 },
  subtotal: { type: Number, required: true, min: 0 },
  orderType: { type: String, enum: ['delivery', 'pickup'], required: true },
  address: { type: String, default: '' },
  landmark: { type: String, default: '' },
  pincode: { type: String, default: '' },
  paymentStatus: { type: String, enum: ['pending', 'cash', 'online', 'paid'], default: 'pending' },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0, min: 0 },
  offerId: { type: String, default: '' },
  offerTitle: { type: String, default: '' },
  offerDiscount: { type: Number, default: 0, min: 0 },
  loyaltyPointsRedeemed: { type: Number, default: 0, min: 0 },
  promotionDiscount: { type: Number, default: 0, min: 0 },
  loyaltyDiscount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, default: 'Order Placed', index: true },
  trackingStep: { type: Number, default: 0, min: 0, max: 5 },
  statusHistory: {
    type: [{
      status: { type: String, required: true },
      at: { type: Date, default: Date.now }
    }],
    default: undefined
  },
  source: { type: String, enum: ['website', 'whatsapp'], default: 'website' }
}, { timestamps: true })
export default mongoose.model('Order', orderSchema)

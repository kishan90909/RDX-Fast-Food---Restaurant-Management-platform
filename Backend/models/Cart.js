import mongoose from 'mongoose'

const cartItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  category: { type: String, default: '' },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1, max: 99 }
}, { _id: false })

const cartSchema = new mongoose.Schema({
  customerKey: { type: String, required: true, unique: true, index: true },
  items: { type: [cartItemSchema], default: [] }
}, { timestamps: true })
export default mongoose.model('Cart', cartSchema)

import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  phone: { type: String, trim: true, default: '' },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, default: '' },
  address: { type: String, default: '' },
  landmark: { type: String, default: '' },
  pincode: { type: String, default: '' },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  otpHash: { type: String, default: '' },
  otpExpiresAt: { type: Date, default: null },
  otpAttempts: { type: Number, default: 0 },
  otpPurpose: { type: String, enum: ['login', 'signup', ''], default: '' },
}, { timestamps: true })

export default mongoose.model('User', userSchema)

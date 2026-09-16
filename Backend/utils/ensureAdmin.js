import User from '../models/User.js'
import { hashPassword } from './auth.js'

export async function ensureAdmin() {
  const email = String(process.env.ADMIN_EMAIL || 'admin@rdxfastfood.com').trim().toLowerCase()
  const password = String(process.env.ADMIN_PASSWORD || 'admin123')
  const existing = await User.findOne({ email })
  if (existing) return
  await User.create({ name: 'RDX Admin', email, passwordHash: hashPassword(password), role: 'admin' })
  console.log(`Admin account initialized: ${email}`)
}

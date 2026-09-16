import Coupon from './models/Coupon.js'

export const defaultCoupons = [
  { code: 'RDX10', type: 'percent', value: 10, maxDiscount: 100, minOrder: 299, label: '10% off up to ₹100', active: true, perUserLimit: 1 },
  { code: 'WELCOME50', type: 'flat', value: 50, maxDiscount: null, minOrder: 499, label: '₹50 off on ₹499+', active: true, perUserLimit: 1 },
  { code: 'RDX20', type: 'percent', value: 20, maxDiscount: 150, minOrder: 699, label: '20% off up to ₹150', active: true, perUserLimit: 1 },
]

export async function seedCouponsIfEmpty() {
  const count = await Coupon.countDocuments()
  if (count > 0) return
  await Coupon.insertMany(defaultCoupons)
  console.log(`Seeded ${defaultCoupons.length} coupons.`)
}

if (process.argv[1] && process.argv[1].endsWith('seedCoupons.js')) {
  const { connectDB } = await import('./config/db.js')
  await connectDB()
  await seedCouponsIfEmpty()
  process.exit(0)
}

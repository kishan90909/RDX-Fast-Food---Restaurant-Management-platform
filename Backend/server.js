import 'dotenv/config'
import app from './app.js'
import { connectDB } from './config/db.js'
import { seedMenuIfEmpty } from './services/menuService.js'
import { ensureAdmin } from './utils/ensureAdmin.js'
import { seedCouponsIfEmpty } from './seedCoupons.js'
import { seedOffersIfEmpty } from './seedOffers.js'

// Local development defaults. Values in server/.env override these defaults.
process.env.MONGODB_URI ||= 'mongodb://127.0.0.1:27017/rdx_fast_food'
process.env.CLIENT_URL ||= 'http://localhost:5173'

const port = Number(process.env.PORT || 5000)

try {
  await connectDB()
  await seedMenuIfEmpty()
  await ensureAdmin()
  await seedCouponsIfEmpty()
  await seedOffersIfEmpty()
  app.listen(port, () => console.log(`RDX Fast Food API running on http://localhost:${port}`))
} catch (error) {
  console.error('Server startup failed:', error.message)
  process.exit(1)
}

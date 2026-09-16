import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import menuRoutes from './routes/menuRoutes.js'
import menuAdminRoutes from './routes/menuAdminRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import authRoutes from './routes/authRoutes.js'
import couponRoutes from './routes/couponRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import notificationRoutes from './routes/notificationRoutes.js'
import kitchenRoutes from './routes/kitchenRoutes.js'
import inventoryRoutes from './routes/inventoryRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import invoiceRoutes from './routes/invoiceRoutes.js'
import loyaltyRoutes from './routes/loyaltyRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'
import personalizedMenuRoutes from './routes/personalizedMenuRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import { notFound, errorHandler } from './middleware/errorMiddleware.js'

const app = express()
app.use(helmet())
app.use(cors({ origin: process.env.CLIENT_URL?.split(',').map(x => x.trim()) || true, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.use('/api/auth', authRoutes)
app.get('/api/health', (req, res) => res.json({ success: true, service: 'rdx-fast-food-api', version: '1.0.0', status: 'ok' }))
app.use('/api/menu/admin', menuAdminRoutes)
app.use('/api/menu', menuRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/offers', offerRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/kitchen', kitchenRoutes)
app.use('/api/inventory', inventoryRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/loyalty', loyaltyRoutes)
app.use('/api/recommendations', recommendationRoutes)
app.use('/api/personalized-menu', personalizedMenuRoutes)
app.use('/api/reviews', reviewRoutes)

app.use(notFound)
app.use(errorHandler)
export default app

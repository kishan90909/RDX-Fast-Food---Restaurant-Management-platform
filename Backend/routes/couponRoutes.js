import { Router } from 'express'
import { listCoupons, validateCoupon } from '../controllers/couponController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', requireAuth, listCoupons)
router.post('/validate', requireAuth, validateCoupon)
export default router

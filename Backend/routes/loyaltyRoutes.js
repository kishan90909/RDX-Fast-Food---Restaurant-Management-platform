import { Router } from 'express'
import { getLoyalty } from '../controllers/loyaltyController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', requireAuth, requireRole('customer'), getLoyalty)
export default router

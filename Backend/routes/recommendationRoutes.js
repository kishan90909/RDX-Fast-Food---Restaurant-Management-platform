import { Router } from 'express'
import { getRecommendations } from '../controllers/recommendationController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', requireAuth, requireRole('customer'), getRecommendations)
export default router

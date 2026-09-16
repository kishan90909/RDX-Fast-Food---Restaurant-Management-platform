import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { getAnalyticsData } from '../controllers/analyticsController.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))
router.get('/', getAnalyticsData)
export default router

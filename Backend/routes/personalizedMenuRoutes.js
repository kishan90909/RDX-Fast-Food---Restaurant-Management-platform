import { Router } from 'express'
import { getPersonalizedMenu } from '../controllers/personalizedMenuController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', requireAuth, requireRole('customer'), getPersonalizedMenu)
export default router

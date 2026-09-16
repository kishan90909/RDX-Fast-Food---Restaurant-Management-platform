import { Router } from 'express'
import { listReviews, upsertReview } from '../controllers/reviewController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
const router = Router()
router.use(requireAuth, requireRole('customer'))
router.get('/', listReviews)
router.put('/:orderId', upsertReview)
export default router

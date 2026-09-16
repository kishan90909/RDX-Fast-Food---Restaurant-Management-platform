import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { listOffers, validateOffer } from '../controllers/offerController.js'

const router = Router()
router.get('/', requireAuth, listOffers)
router.post('/validate', requireAuth, validateOffer)
export default router

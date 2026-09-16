import { Router } from 'express'
import { clearCart, getCart, replaceCart } from '../controllers/cartController.js'
import { customerKey } from '../middleware/validate.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
const router = Router()
router.get('/:customerKey', requireAuth, requireRole('customer'), customerKey, getCart)
router.put('/', requireAuth, requireRole('customer'), customerKey, replaceCart)
router.delete('/:customerKey', requireAuth, requireRole('customer'), customerKey, clearCart)
export default router

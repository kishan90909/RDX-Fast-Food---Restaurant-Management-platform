import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { getKitchenOrders, updateKitchenOrderStatus } from '../controllers/kitchenController.js'

const router = Router()

router.get('/orders', requireAuth, requireRole('admin'), getKitchenOrders)
router.patch('/orders/:orderId/status', requireAuth, requireRole('admin'), updateKitchenOrderStatus)

export default router

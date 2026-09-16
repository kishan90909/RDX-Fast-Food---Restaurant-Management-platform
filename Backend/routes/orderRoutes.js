import { Router } from 'express'
import { createOrder, getOrder, getOrders, getAdminOrders, getAdminOrder, updateAdminOrderStatus, updateAdminPaymentStatus } from '../controllers/orderController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { customerKey } from '../middleware/validate.js'
import { reorder } from '../controllers/reorderController.js'

const router = Router()

// Admin routes MUST be registered before the dynamic /:customerKey routes.
// Otherwise Express treats "admin" as a customerKey and returns 404.
router.get('/admin/all', requireAuth, requireRole('admin'), getAdminOrders)
router.get('/admin/:orderId', requireAuth, requireRole('admin'), getAdminOrder)
router.patch('/admin/:orderId/payment-status', requireAuth, requireRole('admin'), updateAdminPaymentStatus)
router.patch('/admin/:orderId/status', requireAuth, requireRole('admin'), updateAdminOrderStatus)

// Customer order routes.
router.post('/', requireAuth, customerKey, createOrder)
router.get('/:customerKey', requireAuth, customerKey, getOrders)
router.get('/:customerKey/:orderId', requireAuth, customerKey, getOrder)
router.post('/:customerKey/:orderId/reorder', requireAuth, customerKey, reorder)

export default router

import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { listNotifications, markNotificationRead, markAllNotificationsRead, clearNotifications } from '../controllers/notificationController.js'

const router = Router()

// Notifications are private customer data. Admin accounts do not use this customer API.
router.use(requireAuth, requireRole('customer'))
router.get('/', listNotifications)
router.patch('/read-all', markAllNotificationsRead)
router.delete('/', clearNotifications)
router.patch('/:id/read', markNotificationRead)

export default router

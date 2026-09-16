import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import { adjustInventory, listInventory, updateInventory } from '../controllers/inventoryController.js'

const router = Router()
router.get('/', requireAuth, requireRole('admin', 'customer'), listInventory)
router.use(requireAuth, requireRole('admin'))
router.patch('/:itemId', updateInventory)
router.post('/:itemId/adjust', adjustInventory)
export default router

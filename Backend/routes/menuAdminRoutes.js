import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
import {
  createMenuItem,
  deleteMenuCategory,
  deleteMenuItem,
  listAdminMenu,
  updateMenuItem,
} from '../controllers/menuAdminController.js'

const router = Router()
router.use(requireAuth, requireRole('admin'))
router.get('/', listAdminMenu)
router.post('/', createMenuItem)
router.delete('/category/:category', deleteMenuCategory)
router.patch('/:itemId', updateMenuItem)
router.delete('/:itemId', deleteMenuItem)

export default router

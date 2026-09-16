import { Router } from 'express'
import { addFavorite, getFavorites, removeFavorite } from '../controllers/favoriteController.js'
import { customerKey } from '../middleware/validate.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'
const router = Router()
router.get('/:customerKey', requireAuth, requireRole('customer'), customerKey, getFavorites)
router.post('/', requireAuth, requireRole('customer'), customerKey, addFavorite)
router.delete('/:customerKey/:itemId', requireAuth, requireRole('customer'), customerKey, removeFavorite)
export default router

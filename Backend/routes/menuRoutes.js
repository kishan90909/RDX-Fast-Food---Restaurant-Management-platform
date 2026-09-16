import { Router } from 'express'
import { categories, getMenuItem, listMenu } from '../controllers/menuController.js'
const router = Router()
router.get('/', listMenu)
router.get('/categories', categories)
router.get('/:itemId', getMenuItem)
export default router

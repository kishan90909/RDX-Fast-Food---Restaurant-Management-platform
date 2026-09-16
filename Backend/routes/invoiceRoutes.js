import { Router } from 'express'
import { requireAuth } from '../middleware/authMiddleware.js'
import { downloadInvoice } from '../controllers/invoiceController.js'

const router = Router()
router.get('/:orderId', requireAuth, downloadInvoice)
export default router

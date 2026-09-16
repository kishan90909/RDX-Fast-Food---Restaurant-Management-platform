import express from 'express'
import { login, logout, me, register, requestOtp, verifyOtp } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.post('/otp/request', requestOtp)
router.post('/otp/verify', verifyOtp)
router.get('/me', requireAuth, me)
router.post('/logout', logout)
export default router

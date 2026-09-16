import User from '../models/User.js'
import { verifyToken } from '../utils/auth.js'

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || ''
    const headerToken = header.startsWith('Bearer ') ? header.slice(7) : ''
    const cookies = String(req.headers.cookie || '').split(';').reduce((acc, part) => {
      const index = part.indexOf('=')
      if (index > 0) acc[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim())
      return acc
    }, {})
    const token = headerToken || cookies.rdx_auth || ''
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required.' })
    const payload = verifyToken(token)
    const user = await User.findById(payload.sub).select('-passwordHash -otpHash -otpExpiresAt -otpAttempts -otpPurpose')
    if (!user) return res.status(401).json({ success: false, message: 'User account no longer exists.' })
    req.user = user
    return next()
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' })
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: 'You do not have permission to perform this action.' })
    next()
  }
}

import crypto from 'crypto'

const secret = () => process.env.JWT_SECRET || 'rdx-development-secret-change-me'
const b64 = (value) => Buffer.from(value).toString('base64url')

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || '').split(':')
  if (!salt || !hash) return false
  const derived = crypto.scryptSync(password, salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(derived, 'hex'))
}

export function signToken(payload, expiresInSeconds = 60 * 60 * 24 * 7) {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = b64(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + expiresInSeconds }))
  const signature = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${signature}`
}

export function verifyToken(token) {
  const [header, body, signature] = String(token || '').split('.')
  if (!header || !body || !signature) throw new Error('Invalid token')
  const expected = crypto.createHmac('sha256', secret()).update(`${header}.${body}`).digest('base64url')
  if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new Error('Invalid token')
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
  if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired')
  return payload
}

export function generateOtp() {
  return String(crypto.randomInt(100000, 1000000))
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(`${otp}:${secret()}`).digest('hex')
}

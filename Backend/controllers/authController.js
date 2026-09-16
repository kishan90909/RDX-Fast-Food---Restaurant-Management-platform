import User from '../models/User.js'
import { generateOtp, hashOtp, hashPassword, signToken, verifyPassword } from '../utils/auth.js'

const emailPattern = /^\S+@\S+\.\S+$/
const cleanUser = (user) => ({ id: user._id, name: user.name, phone: user.phone || '', email: user.email, address: user.address || '', landmark: user.landmark || '', pincode: user.pincode || '', role: user.role || 'customer' })
const tokenFor = (user) => signToken({ sub: String(user._id), email: user.email, role: user.role })

const cookieName = 'rdx_auth'
const cookieOptions = () => `Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
const setAuthCookie = (res, token) => res.setHeader('Set-Cookie', `${cookieName}=${token}; ${cookieOptions()}`)
const clearAuthCookie = (res) => res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`)

function validateBase({ email, password }) {
  if (!emailPattern.test(email)) return 'Please enter a valid email address.'
  if (password !== undefined && password.length < 6) return 'Password must be at least 6 characters.'
  return ''
}

export async function register(req, res) {
  const { name = '', phone = '', email = '', password = '', address = '', landmark = '', pincode = '' } = req.body || {}
  const normalizedEmail = String(email).trim().toLowerCase()
  const error = validateBase({ email: normalizedEmail, password })
  if (error) return res.status(400).json({ success: false, message: error })
  if (String(name).trim().length < 2) return res.status(400).json({ success: false, message: 'Please enter your name.' })
  if (!/^\d{10}$/.test(String(phone).replace(/\D/g, ''))) return res.status(400).json({ success: false, message: 'Enter a valid 10-digit phone number.' })
  if (String(address).trim().length < 8) return res.status(400).json({ success: false, message: 'Please enter your complete address.' })
  if (!/^\d{6}$/.test(String(pincode).replace(/\D/g, ''))) return res.status(400).json({ success: false, message: 'Enter a valid 6-digit pincode.' })

  const existing = await User.findOne({ email: normalizedEmail })
  if (existing) return res.status(409).json({ success: false, message: 'An account with this email already exists. Please log in.' })
  const user = await User.create({ name: String(name).trim(), phone: String(phone).replace(/\D/g, ''), email: normalizedEmail, passwordHash: hashPassword(password), address: String(address).trim(), landmark: String(landmark).trim(), pincode: String(pincode).replace(/\D/g, '') })
  const token = tokenFor(user)
  setAuthCookie(res, token)
  return res.status(201).json({ success: true, user: cleanUser(user), token, message: 'Account created successfully.' })
}

export async function login(req, res) {
  const { email = '', password = '' } = req.body || {}
  const normalizedEmail = String(email).trim().toLowerCase()
  const error = validateBase({ email: normalizedEmail, password })
  if (error) return res.status(400).json({ success: false, message: error })
  const user = await User.findOne({ email: normalizedEmail })
  if (!user || !verifyPassword(password, user.passwordHash)) return res.status(401).json({ success: false, message: 'Email or password is incorrect.' })
  const token = tokenFor(user)
  setAuthCookie(res, token)
  return res.json({ success: true, user: cleanUser(user), token, message: 'Welcome back!' })
}

export async function requestOtp(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!emailPattern.test(email)) return res.status(400).json({ success: false, message: 'Please enter a valid email address.' })
  const user = await User.findOne({ email })
  if (!user) return res.status(404).json({ success: false, message: 'No RDX Fast Food account was found for this email.' })
  const otp = generateOtp()
  user.otpHash = hashOtp(otp)
  user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000)
  user.otpAttempts = 0
  user.otpPurpose = 'login'
  await user.save()
  const response = { success: true, message: 'OTP generated. It expires in 5 minutes.' }
  if (process.env.NODE_ENV !== 'production') response.devOtp = otp
  return res.json(response)
}

export async function verifyOtp(req, res) {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const otp = String(req.body?.otp || '').trim()
  if (!emailPattern.test(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ success: false, message: 'Enter the valid 6-digit OTP.' })
  const user = await User.findOne({ email })
  if (!user || !user.otpHash || !user.otpExpiresAt) return res.status(400).json({ success: false, message: 'Please request a new OTP.' })
  if (user.otpAttempts >= 5) return res.status(429).json({ success: false, message: 'Too many incorrect OTP attempts. Please request a new OTP.' })
  if (user.otpExpiresAt.getTime() < Date.now()) return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' })
  if (hashOtp(otp) !== user.otpHash) {
    user.otpAttempts += 1
    await user.save()
    return res.status(401).json({ success: false, message: 'Incorrect OTP.' })
  }
  user.otpHash = ''
  user.otpExpiresAt = null
  user.otpAttempts = 0
  user.otpPurpose = ''
  await user.save()
  const token = tokenFor(user)
  setAuthCookie(res, token)
  return res.json({ success: true, user: cleanUser(user), token, message: 'OTP verified. Welcome back!' })
}

export async function logout(req, res) {
  clearAuthCookie(res)
  return res.json({ success: true, message: 'Logged out successfully.' })
}

export async function me(req, res) {
  return res.json({ success: true, user: cleanUser(req.user) })
}

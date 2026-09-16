import Coupon from '../models/Coupon.js'
import CouponUsage from '../models/CouponUsage.js'

function calculateDiscount(coupon, subtotal) {
  if (coupon.type === 'percent') {
    const raw = Math.round(subtotal * coupon.value / 100)
    return Math.min(raw, coupon.maxDiscount ?? raw, subtotal)
  }
  return Math.min(coupon.value, subtotal)
}

function checkCoupon(coupon, subtotal) {
  const now = new Date()
  if (!coupon || !coupon.active) return 'Invalid or inactive coupon.'
  if (coupon.startsAt && now < coupon.startsAt) return 'This coupon is not active yet.'
  if (coupon.expiresAt && now > coupon.expiresAt) return 'This coupon has expired.'
  if (subtotal < coupon.minOrder) return `Minimum order value for ${coupon.code} is ₹${coupon.minOrder}.`
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) return 'This coupon has reached its usage limit.'
  return ''
}

export async function validateCoupon(req, res) {
  const code = String(req.body?.code || '').trim().toUpperCase()
  const subtotal = Number(req.body?.subtotal)
  if (!code) return res.status(400).json({ success: false, message: 'Coupon code is required.' })
  if (!Number.isFinite(subtotal) || subtotal < 0) return res.status(400).json({ success: false, message: 'A valid subtotal is required.' })

  const coupon = await Coupon.findOne({ code }).lean()
  const baseError = checkCoupon(coupon, subtotal)
  if (baseError) return res.status(400).json({ success: false, message: baseError })

  const used = await CouponUsage.exists({ couponId: coupon._id, userId: req.user._id })
  if (used) return res.status(400).json({ success: false, message: 'You have already used this coupon.' })

  const discount = calculateDiscount(coupon, subtotal)
  res.json({
    success: true,
    coupon: { code: coupon.code, type: coupon.type, value: coupon.value, maxDiscount: coupon.maxDiscount, minOrder: coupon.minOrder, label: coupon.label, discount }
  })
}

export async function listCoupons(req, res) {
  const now = new Date()
  const coupons = await Coupon.find({ active: true, $and: [
    { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
    { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] }
  ] }).sort({ createdAt: -1 }).lean()

  const usages = await CouponUsage.find({ userId: req.user._id, couponId: { $in: coupons.map(c => c._id) } }).select('couponId').lean()
  const used = new Set(usages.map(item => String(item.couponId)))
  res.json({ success: true, coupons: coupons.map(c => ({ ...c, alreadyUsed: used.has(String(c._id)) })) })
}

export { calculateDiscount, checkCoupon }

import Offer from '../models/Offer.js'
import OfferUsage from '../models/OfferUsage.js'

export function calculateOfferDiscount(offer, subtotal) {
  if (offer.type === 'percent') {
    return Math.min(Math.round(subtotal * offer.value / 100), offer.maxDiscount ?? Infinity, subtotal)
  }
  return Math.min(offer.value, subtotal)
}

function checkOffer(offer, subtotal) {
  const now = new Date()
  if (!offer || !offer.active) return 'Invalid or inactive offer.'
  if (offer.startsAt && now < offer.startsAt) return 'This offer is not active yet.'
  if (offer.expiresAt && now > offer.expiresAt) return 'This offer has expired.'
  if (subtotal < offer.minOrder) return `Minimum order value for this offer is ₹${offer.minOrder}.`
  return ''
}

export async function listOffers(req, res) {
  const now = new Date()
  const offers = await Offer.find({ active: true, $and: [
    { $or: [{ startsAt: null }, { startsAt: { $lte: now } }] },
    { $or: [{ expiresAt: null }, { expiresAt: { $gte: now } }] }
  ] }).sort({ createdAt: -1 }).lean()
  const usages = await OfferUsage.find({ userId: req.user._id, offerId: { $in: offers.map(o => o._id) } }).select('offerId').lean()
  const used = new Set(usages.map(item => String(item.offerId)))
  res.json({ success: true, offers: offers.map(o => ({ ...o, id: o.code, alreadyUsed: used.has(String(o._id)) })) })
}

export async function validateOffer(req, res) {
  const code = String(req.body?.code || '').trim().toUpperCase()
  const subtotal = Number(req.body?.subtotal)
  if (!code) return res.status(400).json({ success: false, message: 'Offer code is required.' })
  if (!Number.isFinite(subtotal) || subtotal < 0) return res.status(400).json({ success: false, message: 'A valid subtotal is required.' })
  const offer = await Offer.findOne({ code }).lean()
  const error = checkOffer(offer, subtotal)
  if (error) return res.status(400).json({ success: false, message: error })
  const alreadyUsed = await OfferUsage.exists({ offerId: offer._id, userId: req.user._id })
  if (alreadyUsed) return res.status(400).json({ success: false, message: 'You have already used this offer.' })

  const discount = calculateOfferDiscount(offer, subtotal)
  res.json({ success: true, offer: { code: offer.code, id: offer.code, title: offer.title, description: offer.description, type: offer.type, value: offer.value, maxDiscount: offer.maxDiscount, minOrder: offer.minOrder, discount } })
}

export { checkOffer }

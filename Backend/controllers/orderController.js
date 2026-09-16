import Cart from '../models/Cart.js'
import MenuItem from '../models/MenuItem.js'
import Order from '../models/Order.js'
import { generateOrderId } from '../utils/orderId.js'
import Coupon from '../models/Coupon.js'
import CouponUsage from '../models/CouponUsage.js'
import { calculateDiscount, checkCoupon } from './couponController.js'
import Offer from '../models/Offer.js'
import OfferUsage from '../models/OfferUsage.js'
import { calculateOfferDiscount, checkOffer } from './offerController.js'
import { createNotification } from '../services/notificationService.js'
import InventoryItem from '../models/InventoryItem.js'
import LoyaltyAccount from '../models/LoyaltyAccount.js'

export async function createOrder(req, res) {
  const body = req.body || {}
  if (!['delivery', 'pickup'].includes(body.orderType)) return res.status(400).json({ success: false, message: 'orderType must be delivery or pickup' })
  if (body.orderType === 'delivery' && !String(body.address || '').trim()) return res.status(400).json({ success: false, message: 'Delivery address is required' })
  if (!String(body.name || '').trim()) return res.status(400).json({ success: false, message: 'Customer name is required' })

  const requestedItems = Array.isArray(body.items) ? body.items : []
  if (!requestedItems.length) return res.status(400).json({ success: false, message: 'At least one order item is required' })
  const ids = [...new Set(requestedItems.map(x => x?.itemId).filter(Boolean))]
  const catalog = await MenuItem.find({ itemId: { $in: ids }, available: true }).lean()
  const byId = new Map(catalog.map(item => [item.itemId, item]))
  const items = requestedItems.map(x => {
    const item = byId.get(x.itemId)
    if (!item) return null
    const quantity = Math.min(99, Math.max(1, Number(x.quantity) || 1))
    return { itemId: item.itemId, name: item.name, category: item.category, price: item.price, quantity }
  }).filter(Boolean)
  if (!items.length || items.length !== requestedItems.length) return res.status(400).json({ success: false, message: 'One or more menu items are unavailable or invalid' })

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // V1 compatibility: validate the frontend's existing promotion rules on the server.
  // Loyalty balance/accounting moves fully server-side in Version 2/4.
  let couponDiscount = 0
  let couponCode = ''
  let offerDiscount = 0
  let offerId = ''
  let offerTitle = ''

  let reservedCoupon = null
  let reservedOffer = null
  if (body.couponCode) {
    const code = String(body.couponCode).trim().toUpperCase()
    const coupon = await Coupon.findOne({ code })
    const couponError = checkCoupon(coupon, subtotal)
    if (couponError) return res.status(400).json({ success: false, message: couponError })

    const alreadyUsed = await CouponUsage.exists({ couponId: coupon._id, userId: req.user._id })
    if (alreadyUsed) return res.status(400).json({ success: false, message: 'You have already used this coupon.' })

    couponDiscount = calculateDiscount(coupon, subtotal)
    couponCode = coupon.code
    reservedCoupon = { coupon, discount: couponDiscount }
  } else if (body.offerId) {
    const id = String(body.offerId).trim()
    const offer = await Offer.findOne({ code: id }).lean()
    const offerError = checkOffer(offer, subtotal)
    if (offerError) return res.status(400).json({ success: false, message: offerError })
    const alreadyUsed = await OfferUsage.exists({ offerId: offer._id, userId: req.user._id })
    if (alreadyUsed) return res.status(400).json({ success: false, message: 'You have already used this offer.' })
    offerDiscount = calculateOfferDiscount(offer, subtotal)
    offerId = offer.code
    offerTitle = offer.title
    reservedOffer = { offer, discount: offerDiscount }
  }

  const promotionDiscount = Math.min(subtotal, couponDiscount || offerDiscount)
  const totalBeforeLoyalty = Math.max(0, subtotal - promotionDiscount)
  const requestedLoyaltyPoints = Math.max(0, Math.floor(Number(body.loyaltyPointsRedeemed) || 0))
  const maxLoyaltyPoints = Math.floor((totalBeforeLoyalty * 0.2) / 100) * 100
  if (requestedLoyaltyPoints % 100 !== 0) {
    return res.status(400).json({ success: false, message: 'Loyalty points must be redeemed in multiples of 100.' })
  }
  if (requestedLoyaltyPoints > maxLoyaltyPoints) {
    return res.status(400).json({ success: false, message: `You can use up to ${maxLoyaltyPoints} points on this order.` })
  }

  const loyaltyPointsRedeemed = requestedLoyaltyPoints
  const loyaltyDiscount = loyaltyPointsRedeemed / 10
  const total = Math.max(0, totalBeforeLoyalty - loyaltyDiscount)
  let loyaltyReserved = false
  if (loyaltyPointsRedeemed > 0) {
    const account = await LoyaltyAccount.findOneAndUpdate(
      { userId: req.user._id, points: { $gte: loyaltyPointsRedeemed } },
      { $inc: { points: -loyaltyPointsRedeemed, redeemedPoints: loyaltyPointsRedeemed } },
      { new: true }
    )
    if (!account) return res.status(400).json({ success: false, message: 'Insufficient loyalty points.' })
    loyaltyReserved = true
  }

  // Reserve inventory before creating the order so an order cannot consume
  // more stock than is available. The original stock is restored if order
  // creation later fails.
  const reservedInventory = []
  try {
    for (const item of items) {
      const updated = await InventoryItem.findOneAndUpdate(
        { itemId: item.itemId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      )
      if (!updated) {
        const inventory = await InventoryItem.findOne({ itemId: item.itemId }).lean()
        for (const reserved of reservedInventory) {
          await InventoryItem.updateOne({ itemId: reserved.itemId }, { $inc: { stock: reserved.quantity } })
        }
        return res.status(400).json({
          success: false,
          message: inventory ? `${item.name} is out of stock or does not have enough stock.` : `Inventory is not configured for ${item.name}.`,
        })
      }
      reservedInventory.push({ itemId: item.itemId, quantity: item.quantity })
    }
  } catch (error) {
    for (const reserved of reservedInventory) {
      await InventoryItem.updateOne({ itemId: reserved.itemId }, { $inc: { stock: reserved.quantity } }).catch(() => {})
    }
    if (loyaltyReserved) await LoyaltyAccount.updateOne({ userId: req.user._id }, { $inc: { points: loyaltyPointsRedeemed, redeemedPoints: -loyaltyPointsRedeemed } }).catch(() => {})
    throw error
  }

  const newOrderId = generateOrderId()
  let offerUsageCreated = false
  let couponUsageCreated = false
  let couponCountIncremented = false

  const rollbackReservations = async () => {
    if (offerUsageCreated && reservedOffer) {
      await OfferUsage.deleteOne({ offerId: reservedOffer.offer._id, userId: req.user._id, orderId: newOrderId }).catch(() => {})
    }
    if (couponUsageCreated && reservedCoupon) {
      await CouponUsage.deleteOne({ couponId: reservedCoupon.coupon._id, userId: req.user._id, orderId: newOrderId }).catch(() => {})
    }
    if (couponCountIncremented && reservedCoupon) {
      await Coupon.updateOne({ _id: reservedCoupon.coupon._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }).catch(() => {})
    }
    for (const reserved of reservedInventory) {
      await InventoryItem.updateOne({ itemId: reserved.itemId }, { $inc: { stock: reserved.quantity } }).catch(() => {})
    }
    if (loyaltyReserved) {
      await LoyaltyAccount.updateOne(
        { userId: req.user._id },
        { $inc: { points: loyaltyPointsRedeemed, redeemedPoints: -loyaltyPointsRedeemed } }
      ).catch(() => {})
    }
  }

  if (reservedOffer) {
    try {
      await OfferUsage.create({ offerId: reservedOffer.offer._id, offerCode: reservedOffer.offer.code, userId: req.user._id, orderId: newOrderId, discount: reservedOffer.discount })
      offerUsageCreated = true
    } catch (error) {
      await rollbackReservations()
      if (error?.code === 11000) return res.status(400).json({ success: false, message: 'You have already used this offer.' })
      return res.status(400).json({ success: false, message: error.message || 'Unable to apply offer.' })
    }
  }

  if (reservedCoupon) {
    try {
      await CouponUsage.create({ couponId: reservedCoupon.coupon._id, couponCode: reservedCoupon.coupon.code, userId: req.user._id, orderId: newOrderId, discount: reservedCoupon.discount })
      couponUsageCreated = true
      const updated = await Coupon.findOneAndUpdate(
        { _id: reservedCoupon.coupon._id, active: true, $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
        { $inc: { usedCount: 1 } },
        { new: true }
      )
      if (!updated) throw new Error('Coupon usage limit reached.')
      couponCountIncremented = true
    } catch (error) {
      await rollbackReservations()
      if (error?.code === 11000) return res.status(400).json({ success: false, message: 'You have already used this coupon.' })
      return res.status(400).json({ success: false, message: error.message || 'Unable to apply coupon.' })
    }
  }

  let order
  try {
    order = await Order.create({
    orderId: newOrderId,
    userId: req.user?._id,
    customerKey: req.customerKey,
    customerEmail: req.user?.email || body.customerEmail,
    name: req.user?.name || body.name.trim(),
    phone: req.user?.phone || body.phone,
    items,
    subtotal,
    orderType: body.orderType,
    address: body.orderType === 'delivery' ? String(body.address || '').trim() : '',
    landmark: body.orderType === 'delivery' ? String(body.landmark || '').trim() : '',
    pincode: body.orderType === 'delivery' ? String(body.pincode || '').trim() : '',
    paymentStatus: ['pending', 'cash', 'online', 'paid'].includes(body.paymentStatus) ? body.paymentStatus : 'pending',
    couponCode,
    couponDiscount,
    offerId,
    offerTitle,
    offerDiscount,
    promotionDiscount,
    loyaltyPointsRedeemed,
    loyaltyDiscount,
    total,
    status: 'Order Placed',
    trackingStep: 0,
    statusHistory: [{ status: 'Order Placed', at: new Date() }],
    source: body.source === 'whatsapp' ? 'whatsapp' : 'website'
    })
  } catch (error) {
    if (reservedOffer) {
      await OfferUsage.deleteOne({ offerId: reservedOffer.offer._id, userId: req.user._id, orderId: newOrderId }).catch(() => {})
    }
    if (reservedCoupon) {
      await CouponUsage.deleteOne({ couponId: reservedCoupon.coupon._id, userId: req.user._id, orderId: newOrderId }).catch(() => {})
      await Coupon.updateOne({ _id: reservedCoupon.coupon._id, usedCount: { $gt: 0 } }, { $inc: { usedCount: -1 } }).catch(() => {})
    }
    for (const reserved of reservedInventory) {
      await InventoryItem.updateOne({ itemId: reserved.itemId }, { $inc: { stock: reserved.quantity } }).catch(() => {})
    }
    throw error
  }
  await Cart.findOneAndUpdate({ customerKey: req.customerKey }, { $set: { items: [] } }, { upsert: true }).catch((error) => {
    console.error('Cart cleanup failed after order creation:', error?.message || error)
  })

  const loyaltyPointsEarned = Math.floor(totalBeforeLoyalty / 50)
  let loyalty = { points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] }
  try {
    const loyaltyAccount = await LoyaltyAccount.findOneAndUpdate(
      { userId: req.user._id },
      {
        $setOnInsert: { userId: req.user._id },
        $inc: { points: loyaltyPointsEarned, lifetimePoints: loyaltyPointsEarned },
        $push: { history: { $each: [
          ...(loyaltyPointsRedeemed > 0 ? [{ id: `redeem-${order.orderId}`, type: 'redeemed', points: loyaltyPointsRedeemed, amount: loyaltyDiscount, orderId: order.orderId, date: new Date() }] : []),
          ...(loyaltyPointsEarned > 0 ? [{ id: `earn-${order.orderId}`, type: 'earned', points: loyaltyPointsEarned, amount: totalBeforeLoyalty, orderId: order.orderId, date: new Date() }] : []),
        ], $slice: -100 } },
      },
      { new: true, upsert: true }
    ).lean()
    loyalty = {
      points: Number(loyaltyAccount?.points || 0),
      lifetimePoints: Number(loyaltyAccount?.lifetimePoints || 0),
      redeemedPoints: Number(loyaltyAccount?.redeemedPoints || 0),
      history: Array.isArray(loyaltyAccount?.history) ? loyaltyAccount.history : [],
    }
  } catch (error) {
    console.error('Loyalty accounting failed after order creation:', error?.message || error)
  }

  await createNotification({
    userId: req.user._id,
    type: 'order',
    title: 'Order placed successfully',
    message: `${order.orderId} has been placed successfully.`,
    orderId: order.orderId,
  }).catch(() => null)

  res.status(201).json({ success: true, order: { ...order.toObject(), loyaltyPointsEarned }, loyalty })
}

export async function getOrders(req, res) {
  const email = String(req.user?.email || '').trim().toLowerCase()
  const legacyKey = `email:${email}`
  const orders = await Order.find({
    $or: [
      { userId: req.user._id },
      { customerEmail: email },
      { customerKey: legacyKey }
    ]
  }).sort({ createdAt: -1 }).limit(100).lean()
  res.json({ success: true, orders })
}

export async function getOrder(req, res) {
  const email = String(req.user?.email || '').trim().toLowerCase()
  const legacyKey = `email:${email}`
  const order = await Order.findOne({
    orderId: req.params.orderId,
    $or: [
      { userId: req.user._id },
      { customerEmail: email },
      { customerKey: legacyKey }
    ]
  }).lean()
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  res.json({ success: true, order })
}

const DELIVERY_STATUSES = ['Order Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']
const PICKUP_STATUSES = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Picked Up']

export async function getAdminOrders(req, res) {
  const orders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(500)
    .lean()

  // Keep the response compatible with older orders that predate statusHistory.
  const normalized = orders.map((order) => ({
    ...order,
    status: order.status || 'Order Placed',
    trackingStep: Number.isFinite(Number(order.trackingStep)) ? Number(order.trackingStep) : 0,
    statusHistory: Array.isArray(order.statusHistory) && order.statusHistory.length
      ? order.statusHistory
      : [{ status: order.status || 'Order Placed', at: order.createdAt || new Date().toISOString() }],
  }))

  res.json({ success: true, orders: normalized })
}


export async function getAdminOrder(req, res) {
  const orderId = String(req.params.orderId || '').trim()
  if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required.' })

  const order = await Order.findOne({ orderId }).lean()
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

  res.json({
    success: true,
    order: {
      ...order,
      status: order.status || 'Order Placed',
      trackingStep: Number.isFinite(Number(order.trackingStep)) ? Number(order.trackingStep) : 0,
      statusHistory: Array.isArray(order.statusHistory) && order.statusHistory.length
        ? order.statusHistory
        : [{ status: order.status || 'Order Placed', at: order.createdAt || new Date().toISOString() }],
    },
  })
}

export async function updateAdminPaymentStatus(req, res) {
  const orderId = String(req.params.orderId || '').trim()
  const paymentStatus = String(req.body?.paymentStatus || '').trim().toLowerCase()
  const allowed = ['pending', 'cash', 'online', 'paid']
  if (!orderId || !allowed.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'A valid payment status is required.' })
  }

  const order = await Order.findOneAndUpdate(
    { orderId },
    { $set: { paymentStatus } },
    { new: true, runValidators: true }
  )
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

  res.json({ success: true, message: 'Payment status updated successfully.', order })
}

export async function updateAdminOrderStatus(req, res) {
  const orderId = String(req.params.orderId || '').trim()
  const status = String(req.body?.status || '').trim()
  if (!orderId || !status) return res.status(400).json({ success: false, message: 'Order ID and status are required.' })

  const order = await Order.findOne({ orderId })
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

  const flow = order.orderType === 'pickup' ? PICKUP_STATUSES : DELIVERY_STATUSES
  const current = order.status || 'Order Placed'
  const currentIndex = flow.indexOf(current)
  const nextIndex = flow.indexOf(status)
  if (nextIndex < 0) return res.status(400).json({ success: false, message: `Invalid status for ${order.orderType} order.` })
  if (currentIndex < 0) return res.status(400).json({ success: false, message: `Order has an unsupported current status: ${current}` })
  if (nextIndex < currentIndex) return res.status(400).json({ success: false, message: 'Order status cannot move backwards.' })

  if (status !== current) {
    order.status = status
    order.trackingStep = nextIndex
    order.statusHistory = Array.isArray(order.statusHistory) ? order.statusHistory : []
    order.statusHistory.push({ status, at: new Date() })
    await order.save()
    if (order.userId) {
      await createNotification({
        userId: order.userId,
        type: 'tracking',
        title: `Order ${status}`,
        message: `${order.orderId} is now ${status.toLowerCase()}.`,
        orderId: order.orderId,
      }).catch(() => null)
    }
  }

  res.json({ success: true, order })
}


import Cart from '../models/Cart.js'
import MenuItem from '../models/MenuItem.js'
import Order from '../models/Order.js'

export async function reorder(req, res) {
  const email = String(req.user?.email || '').trim().toLowerCase()
  const legacyKey = `email:${email}`
  const order = await Order.findOne({
    orderId: req.params.orderId,
    $or: [{ userId: req.user._id }, { customerEmail: email }, { customerKey: legacyKey }]
  }).lean()

  if (!order) return res.status(404).json({ success: false, message: 'Order not found' })
  if (!Array.isArray(order.items) || !order.items.length) return res.status(400).json({ success: false, message: 'This order has no items to reorder' })

  const ids = [...new Set(order.items.map(item => item.itemId).filter(Boolean))]
  const catalog = await MenuItem.find({ itemId: { $in: ids }, available: true }).lean()
  const byId = new Map(catalog.map(item => [item.itemId, item]))
  const unavailable = []
  const additions = []

  for (const oldItem of order.items) {
    const item = byId.get(oldItem.itemId)
    if (!item) {
      unavailable.push(oldItem.name || oldItem.itemId)
      continue
    }
    additions.push({
      itemId: item.itemId,
      name: item.name,
      category: item.category,
      price: item.price,
      quantity: Math.min(99, Math.max(1, Number(oldItem.quantity) || 1))
    })
  }

  if (!additions.length) return res.status(409).json({ success: false, message: 'All items from this order are currently unavailable', unavailable })

  const currentCart = await Cart.findOne({ customerKey: req.customerKey }).lean()
  const merged = Array.isArray(currentCart?.items) ? currentCart.items.map(item => ({ ...item })) : []
  for (const addition of additions) {
    const existing = merged.find(item => item.itemId === addition.itemId)
    if (existing) {
      existing.quantity = Math.min(99, Number(existing.quantity || 0) + addition.quantity)
      existing.name = addition.name
      existing.price = addition.price
    } else {
      merged.push(addition)
    }
  }

  const cart = await Cart.findOneAndUpdate(
    { customerKey: req.customerKey },
    { $set: { items: merged } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()

  res.json({
    success: true,
    cart,
    reorderedOrderId: order.orderId,
    unavailable,
    message: unavailable.length
      ? `Reordered available items. ${unavailable.length} item${unavailable.length === 1 ? '' : 's'} unavailable.`
      : 'All order items added to your cart.'
  })
}

import Cart from '../models/Cart.js'
import MenuItem from '../models/MenuItem.js'

export async function getCart(req, res) {
  const cart = await Cart.findOne({ customerKey: req.customerKey }).lean()
  res.json({ success: true, cart: cart || { customerKey: req.customerKey, items: [] } })
}

export async function replaceCart(req, res) {
  const incoming = Array.isArray(req.body.items) ? req.body.items : []
  const ids = [...new Set(incoming.map(x => x?.itemId).filter(Boolean))]
  const catalog = await MenuItem.find({ itemId: { $in: ids }, available: true }).lean()
  const byId = new Map(catalog.map(item => [item.itemId, item]))
  const items = incoming.map(x => {
    const item = byId.get(x.itemId)
    if (!item) return null
    const quantity = Math.min(99, Math.max(1, Number(x.quantity) || 1))
    return { itemId: item.itemId, name: item.name, category: item.category, price: item.price, quantity }
  }).filter(Boolean)
  const cart = await Cart.findOneAndUpdate(
    { customerKey: req.customerKey },
    { $set: { items } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
  res.json({ success: true, cart })
}

export async function clearCart(req, res) {
  await Cart.findOneAndUpdate({ customerKey: req.customerKey }, { $set: { items: [] } }, { upsert: true })
  res.json({ success: true, cart: { customerKey: req.customerKey, items: [] } })
}

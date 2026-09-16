import Order from '../models/Order.js'
import MenuItem from '../models/MenuItem.js'

const periodDays = (value) => {
  if (String(value) === 'all') return null
  const days = Number(value)
  if (![1, 7, 30, 90].includes(days)) return 30
  return days
}

export async function getAnalyticsData(req, res) {
  const days = periodDays(req.query?.period)
  const now = Date.now()
  const query = {}
  if (days !== null) query.createdAt = { $gte: new Date(now - days * 86400000) }

  const [orders, menuItems] = await Promise.all([
    Order.find(query).sort({ createdAt: -1 }).lean(),
    MenuItem.find({}).select('itemId name category').lean(),
  ])

  // Keep the analytics UI unchanged while replacing its backend MongoDB source with
  // authoritative MongoDB data. Category metadata is joined here because order
  // items intentionally store only the snapshot needed for an order.
  const categoryByItemId = Object.fromEntries(menuItems.map(item => [item.itemId, item.category]))
  const normalizedOrders = orders.map(order => ({
    ...order,
    id: order.orderId,
    createdAt: order.createdAt ? new Date(order.createdAt).getTime() : 0,
    date: order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '',
    items: (order.items || []).map(item => ({ ...item, category: categoryByItemId[item.itemId] || 'Other' })),
  }))

  res.json({
    success: true,
    period: days === null ? 'all' : String(days),
    orders: normalizedOrders,
    menuItems,
    generatedAt: new Date().toISOString(),
  })
}

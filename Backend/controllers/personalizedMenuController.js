import Order from '../models/Order.js'
import Favorite from '../models/Favorite.js'
import MenuItem from '../models/MenuItem.js'
import InventoryItem from '../models/InventoryItem.js'

const buildId = (item) => item.itemId || `${item.category || ''}::${item.name}`

export async function getPersonalizedMenu(req, res) {
  const customerKey = `email:${String(req.user.email || '').trim().toLowerCase()}`
  const [orders, favorites, menuItems, inventory] = await Promise.all([
    Order.find({ userId: req.user._id }).select('items createdAt').sort({ createdAt: -1 }).lean(),
    Favorite.find({ customerKey }).select('itemId -_id').lean(),
    MenuItem.find({ available: true }).lean(),
    InventoryItem.find().select('itemId stock').lean(),
  ])

  const purchased = new Map()
  const categories = new Map()
  const recentIds = []
  for (const order of orders) {
    for (const orderItem of order.items || []) {
      const id = buildId(orderItem)
      const qty = Number(orderItem.quantity || 1)
      purchased.set(id, (purchased.get(id) || 0) + qty)
      const menu = menuItems.find((m) => m.itemId === id)
      const category = menu?.category || orderItem.category || ''
      if (category) categories.set(category, (categories.get(category) || 0) + qty)
      if (!recentIds.includes(id)) recentIds.push(id)
    }
  }

  const favoriteSet = new Set(favorites.map((x) => x.itemId))
  const stockMap = new Map(inventory.map((x) => [x.itemId, Number(x.stock || 0)]))
  const all = menuItems
    .filter((item) => !stockMap.has(item.itemId) || stockMap.get(item.itemId) > 0)
    .map((item) => {
      const purchaseCount = purchased.get(item.itemId) || 0
      const categoryCount = categories.get(item.category) || 0
      const favorite = favoriteSet.has(item.itemId)
      let score = 0
      let newTry = 0
      if (purchaseCount) score += 40 + Math.min(20, purchaseCount * 5)
      if (favorite) score += 30
      if (categoryCount) score += Math.min(20, categoryCount * 2)
      if (item.bestseller) score += 8
      if (item.special) score += 6
      if (!purchaseCount) newTry += 20
      if (!favorite) newTry += 5
      if (item.bestseller) newTry += 10
      if (item.special) newTry += 8
      if (!categoryCount) newTry += 8
      return {
        id: item.itemId,
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        price: item.price,
        priceLabel: item.priceLabel,
        available: Boolean(item.available),
        bestseller: Boolean(item.bestseller),
        special: Boolean(item.special),
        dietType: item.dietType,
        purchaseCount,
        categoryCount,
        favorite,
        score,
        newTry,
      }
    })

  const forYou = [...all].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)).slice(0, 8)
  const favoriteItems = all.filter((item) => item.favorite).slice(0, 8)
  const recent = recentIds.map((id) => all.find((item) => item.itemId === id)).filter(Boolean).slice(0, 8)
  const discover = all.filter((item) => item.purchaseCount === 0).sort((a, b) => b.newTry - a.newTry || a.name.localeCompare(b.name)).slice(0, 8)

  res.json({ success: true, personalized: orders.length > 0 || favorites.length > 0, tabs: { forYou, favorites: favoriteItems, recent, discover } })
}

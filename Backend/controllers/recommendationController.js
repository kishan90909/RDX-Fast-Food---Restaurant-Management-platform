import Order from '../models/Order.js'
import Favorite from '../models/Favorite.js'
import MenuItem from '../models/MenuItem.js'
import InventoryItem from '../models/InventoryItem.js'

export async function getRecommendations(req, res) {
  const customerKey = `email:${String(req.user.email || '').trim().toLowerCase()}`
  const [orders, favorites, menuItems, inventory] = await Promise.all([
    Order.find({ userId: req.user._id }).select('items').lean(),
    Favorite.find({ customerKey }).select('itemId -_id').lean(),
    MenuItem.find({ available: true }).lean(),
    InventoryItem.find().select('itemId stock').lean(),
  ])

  const purchased = new Map()
  const categories = new Map()
  for (const order of orders) {
    for (const item of order.items || []) {
      const id = item.itemId || `${item.category || ''}::${item.name}`
      const qty = Number(item.quantity || 1)
      purchased.set(id, (purchased.get(id) || 0) + qty)
      const category = String(item.category || id.split('::')[0] || '').trim()
      if (category) categories.set(category, (categories.get(category) || 0) + qty)
    }
  }

  const favoriteSet = new Set(favorites.map(x => x.itemId))
  const stockMap = new Map(inventory.map(x => [x.itemId, Number(x.stock || 0)]))
  const purchasedCategories = new Set(categories.keys())

  const recommendations = menuItems
    .filter(item => !stockMap.has(item.itemId) || stockMap.get(item.itemId) > 0)
    .map(item => {
      const purchasedQty = purchased.get(item.itemId) || 0
      const categoryScore = categories.get(item.category) || 0
      let score = 0
      let reason = 'Popular pick'
      if (purchasedQty) score += 14 + Math.min(12, purchasedQty * 2)
      if (favoriteSet.has(item.itemId)) score += 11
      if (purchasedCategories.has(item.category)) score += 7
      if (categoryScore) score += Math.min(8, categoryScore)
      if (item.bestseller) score += 5
      if (item.special) score += 3
      if (purchasedQty) reason = 'Based on your previous orders'
      else if (favoriteSet.has(item.itemId)) reason = 'Based on your favorites'
      else if (purchasedCategories.has(item.category)) reason = `Matches your ${item.category} taste`
      else if (item.bestseller) reason = 'Popular with RDX customers'
      else if (item.special) reason = "Chef's recommendation"
      return {
        id: item.itemId,
        itemId: item.itemId,
        name: item.name,
        category: item.category,
        price: item.price,
        priceLabel: item.priceLabel,
        bestseller: Boolean(item.bestseller),
        special: Boolean(item.special),
        available: Boolean(item.available),
        dietType: item.dietType,
        score,
        reason,
      }
    })
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 6)

  res.json({ success: true, personalized: orders.length > 0, recommendations })
}

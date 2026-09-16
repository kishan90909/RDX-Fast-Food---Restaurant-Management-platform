import MenuItem from '../models/MenuItem.js'
import InventoryItem from '../models/InventoryItem.js'

export async function listMenu(req, res) {
  const { search = '', category, diet, filter } = req.query
  const query = { available: true }
  if (category) query.category = category
  if (diet && ['Veg', 'Non-Veg'].includes(diet)) query.dietType = diet
  if (filter === 'Bestseller') query.bestseller = true
  if (filter === "Chef's Special") query.special = true
  if (search.trim()) query.$or = [
    { name: { $regex: search.trim(), $options: 'i' } },
    { category: { $regex: search.trim(), $options: 'i' } }
  ]
  const items = await MenuItem.find(query).sort({ category: 1, name: 1 }).lean()
  const inventory = await InventoryItem.find({ itemId: { $in: items.map((item) => item.itemId) } }).select('itemId stock').lean()
  const stockById = new Map(inventory.map((item) => [item.itemId, Number(item.stock || 0)]))
  const visibleItems = items.filter((item) => !stockById.has(item.itemId) || stockById.get(item.itemId) > 0)
  res.json({ success: true, count: visibleItems.length, items: visibleItems })
}

export async function categories(req, res) {
  const menuItems = await MenuItem.find({ available: true }).select('itemId category').lean()
  const inventory = await InventoryItem.find({ itemId: { $in: menuItems.map((item) => item.itemId) } }).select('itemId stock').lean()
  const stockById = new Map(inventory.map((item) => [item.itemId, Number(item.stock || 0)]))
  const categories = [...new Set(menuItems.filter((item) => !stockById.has(item.itemId) || stockById.get(item.itemId) > 0).map((item) => item.category))].sort()
  res.json({ success: true, categories })
}

export async function getMenuItem(req, res) {
  const item = await MenuItem.findOne({ itemId: req.params.itemId, available: true }).lean()
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found' })
  const inventory = await InventoryItem.findOne({ itemId: item.itemId }).select('stock').lean()
  if (inventory && Number(inventory.stock || 0) <= 0) return res.status(404).json({ success: false, message: 'Menu item is out of stock' })
  res.json({ success: true, item })
}

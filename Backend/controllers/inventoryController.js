import InventoryItem from '../models/InventoryItem.js'
import MenuItem from '../models/MenuItem.js'

const DEFAULT_STOCK = 20
const DEFAULT_THRESHOLD = 5

export async function listInventory(req, res) {
  const menuItems = await MenuItem.find({}).select('itemId name category').lean()
  if (menuItems.length) {
    await InventoryItem.bulkWrite(menuItems.map((item) => ({
      updateOne: {
        filter: { itemId: item.itemId },
        update: {
          $set: { name: item.name, category: item.category },
          $setOnInsert: { stock: DEFAULT_STOCK, lowStockThreshold: DEFAULT_THRESHOLD, unit: 'items' },
        },
        upsert: true,
      },
    })), { ordered: false })
  }
  const items = await InventoryItem.find({}).sort({ category: 1, name: 1 }).lean()
  const normalized = items.map((item) => ({ ...item, id: item.itemId }))
  res.json({ success: true, items: normalized })
}

export async function updateInventory(req, res) {
  const itemId = String(req.params.itemId || '').trim()
  if (!itemId) return res.status(400).json({ success: false, message: 'Item ID is required.' })
  const patch = {}
  if (req.body?.stock !== undefined) patch.stock = Math.max(0, Number(req.body.stock) || 0)
  if (req.body?.lowStockThreshold !== undefined) patch.lowStockThreshold = Math.max(0, Number(req.body.lowStockThreshold) || 0)
  if (req.body?.unit !== undefined) patch.unit = String(req.body.unit).trim() || 'items'
  if (!Object.keys(patch).length) return res.status(400).json({ success: false, message: 'No inventory changes supplied.' })

  const menu = await MenuItem.findOne({ itemId }).select('itemId name category').lean()
  if (!menu) return res.status(404).json({ success: false, message: 'Menu item not found.' })
  const item = await InventoryItem.findOneAndUpdate(
    { itemId },
    { $set: { ...patch, name: menu.name, category: menu.category } },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  ).lean()
  res.json({ success: true, item: { ...item, id: item.itemId } })
}

export async function adjustInventory(req, res) {
  const itemId = String(req.params.itemId || '').trim()
  const amount = Number(req.body?.amount)
  if (!itemId || !Number.isFinite(amount) || amount === 0) return res.status(400).json({ success: false, message: 'A non-zero stock adjustment is required.' })
  const menu = await MenuItem.findOne({ itemId }).select('itemId name category').lean()
  if (!menu) return res.status(404).json({ success: false, message: 'Menu item not found.' })
  const item = await InventoryItem.findOne({ itemId })
  if (!item) {
    const created = await InventoryItem.create({ itemId, name: menu.name, category: menu.category, stock: Math.max(0, DEFAULT_STOCK + amount), lowStockThreshold: DEFAULT_THRESHOLD, unit: 'items' })
    return res.json({ success: true, item: { ...created.toObject(), id: created.itemId } })
  }
  item.stock = Math.max(0, Number(item.stock || 0) + amount)
  item.name = menu.name
  item.category = menu.category
  await item.save()
  res.json({ success: true, item: { ...item.toObject(), id: item.itemId } })
}

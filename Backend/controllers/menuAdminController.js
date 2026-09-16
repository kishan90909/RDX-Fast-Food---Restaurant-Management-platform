import MenuItem from '../models/MenuItem.js'
import InventoryItem from '../models/InventoryItem.js'
import { slugify } from '../utils/slugify.js'
import { lowestPrice } from '../utils/parsePrice.js'

function dietType(name, category) {
  const text = `${name} ${category}`.toLowerCase()
  return ['chicken', 'egg', 'non-veg'].some((keyword) => text.includes(keyword)) ? 'Non-Veg' : 'Veg'
}

function cleanText(value) {
  return String(value ?? '').trim()
}

function buildPayload(body, existing = {}) {
  const name = cleanText(body.name ?? existing.name)
  const category = cleanText(body.category ?? existing.category)
  const priceLabel = cleanText(body.price ?? body.priceLabel ?? existing.priceLabel)

  if (!name || !category || !priceLabel) {
    const error = new Error('Category, item name and price are required.')
    error.status = 400
    throw error
  }

  const price = lowestPrice(priceLabel)
  if (!Number.isFinite(price) || price < 0) {
    const error = new Error('Price must contain a valid number.')
    error.status = 400
    throw error
  }

  return {
    name,
    category,
    price,
    priceLabel,
    available: body.available === undefined ? existing.available !== false : Boolean(body.available),
    bestseller: body.bestseller === undefined ? Boolean(existing.bestseller) : Boolean(body.bestseller),
    special: body.special === undefined ? Boolean(existing.special) : Boolean(body.special),
    dietType: body.dietType && ['Veg', 'Non-Veg'].includes(body.dietType)
      ? body.dietType
      : dietType(name, category),
  }
}

function toCatalog(items) {
  const catalog = {}
  for (const item of items) {
    if (!catalog[item.category]) catalog[item.category] = []
    catalog[item.category].push({
      id: item.itemId,
      itemId: item.itemId,
      name: item.name,
      price: item.priceLabel || `₹${item.price}`,
      bestseller: Boolean(item.bestseller),
      special: Boolean(item.special),
      available: item.available !== false,
      dietType: item.dietType,
    })
  }
  return catalog
}

export async function listAdminMenu(req, res) {
  const { search = '', category } = req.query
  const query = {}
  if (category?.trim()) query.category = category.trim()
  if (search.trim()) {
    query.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { category: { $regex: search.trim(), $options: 'i' } },
    ]
  }
  const items = await MenuItem.find(query).sort({ category: 1, name: 1 }).lean()
  res.json({ success: true, count: items.length, items, catalog: toCatalog(items) })
}

export async function createMenuItem(req, res) {
  const payload = buildPayload(req.body)
  const baseId = `${slugify(payload.category)}::${slugify(payload.name)}`
  let itemId = baseId
  let suffix = 2
  while (await MenuItem.exists({ itemId })) itemId = `${baseId}-${suffix++}`

  const item = await MenuItem.create({ itemId, ...payload })
  res.status(201).json({ success: true, message: 'Menu item created successfully.', item })
}

export async function updateMenuItem(req, res) {
  const item = await MenuItem.findOne({ itemId: req.params.itemId })
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' })

  const payload = buildPayload(req.body, item)
  Object.assign(item, payload)
  await item.save()
  res.json({ success: true, message: 'Menu item updated successfully.', item })
}

export async function deleteMenuItem(req, res) {
  const item = await MenuItem.findOneAndDelete({ itemId: req.params.itemId })
  if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' })
  await InventoryItem.deleteOne({ itemId: item.itemId })
  res.json({ success: true, message: 'Menu item deleted successfully.', itemId: item.itemId })
}

export async function deleteMenuCategory(req, res) {
  const category = cleanText(req.params.category)
  if (!category) return res.status(400).json({ success: false, message: 'Category is required.' })
  const items = await MenuItem.find({ category }).select('itemId').lean()
  if (!items.length) return res.status(404).json({ success: false, message: 'Category not found.' })
  await MenuItem.deleteMany({ category })
  await InventoryItem.deleteMany({ itemId: { $in: items.map((item) => item.itemId) } })
  res.json({ success: true, message: 'Menu category deleted successfully.', category, deletedCount: items.length })
}

import Favorite from '../models/Favorite.js'

export async function getFavorites(req, res) {
  const favorites = await Favorite.find({ customerKey: req.customerKey }).select('itemId -_id').lean()
  res.json({ success: true, favorites: favorites.map(x => x.itemId) })
}

export async function addFavorite(req, res) {
  const { itemId } = req.body
  if (typeof itemId !== 'string' || !itemId.trim()) return res.status(400).json({ success: false, message: 'itemId is required' })
  await Favorite.updateOne({ customerKey: req.customerKey, itemId: itemId.trim() }, { $setOnInsert: { customerKey: req.customerKey, itemId: itemId.trim() } }, { upsert: true })
  res.status(201).json({ success: true, itemId: itemId.trim() })
}

export async function removeFavorite(req, res) {
  const { itemId } = req.params
  await Favorite.deleteOne({ customerKey: req.customerKey, itemId })
  res.json({ success: true, itemId })
}

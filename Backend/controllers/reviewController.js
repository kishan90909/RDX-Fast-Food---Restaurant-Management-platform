import Review from '../models/Review.js'
import Order from '../models/Order.js'

export async function listReviews(req, res) {
  const reviews = await Review.find({ userId: req.user._id }).sort({ updatedAt: -1 }).lean()
  res.json({ success: true, reviews: reviews.map(review => ({ ...review, customerEmail: req.user.email })) })
}

export async function upsertReview(req, res) {
  const orderId = String(req.params.orderId || '').trim()
  const rating = Number(req.body?.rating)
  const comment = String(req.body?.comment || '').trim()
  if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required.' })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' })
  if (!comment || comment.length > 500) return res.status(400).json({ success: false, message: 'Review comment is required and must be at most 500 characters.' })
  const order = await Order.findOne({ orderId, userId: req.user._id }).lean()
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
  if (order.status !== 'Delivered' && order.status !== 'Picked Up') return res.status(400).json({ success: false, message: 'You can review an order after it is completed.' })
  const review = await Review.findOneAndUpdate(
    { userId: req.user._id, orderId },
    { $set: { rating, comment } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
  res.json({ success: true, review: { ...review, customerEmail: req.user.email } })
}

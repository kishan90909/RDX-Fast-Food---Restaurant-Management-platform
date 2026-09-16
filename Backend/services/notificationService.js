import Notification from '../models/Notification.js'

export async function createNotification({ userId, type = 'info', title, message, orderId = '' }) {
  if (!userId || !title || !message) return null
  return Notification.create({ userId, type, title, message, orderId })
}

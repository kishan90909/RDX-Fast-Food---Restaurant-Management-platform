import Notification from '../models/Notification.js'

export async function listNotifications(req, res) {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean()
  res.json({ success: true, notifications })
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { $set: { read: true } },
    { new: true }
  ).lean()
  if (!notification) return res.status(404).json({ success: false, message: 'Notification not found.' })
  res.json({ success: true, notification })
}

export async function markAllNotificationsRead(req, res) {
  await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } })
  res.json({ success: true })
}

export async function clearNotifications(req, res) {
  await Notification.deleteMany({ userId: req.user._id })
  res.json({ success: true })
}

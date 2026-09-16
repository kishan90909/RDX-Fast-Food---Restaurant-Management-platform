import Order from '../models/Order.js'
import { updateAdminOrderStatus } from './orderController.js'

const KITCHEN_STATUSES = ['Order Placed', 'Preparing', 'Ready', 'Ready for Pickup']

export async function getKitchenOrders(req, res) {
  const orders = await Order.find({ status: { $in: KITCHEN_STATUSES } })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean()

  const normalized = orders.map((order) => ({
    ...order,
    orderId: order.orderId,
    status: order.status || 'Order Placed',
    trackingStep: Number.isFinite(Number(order.trackingStep)) ? Number(order.trackingStep) : 0,
    statusHistory: Array.isArray(order.statusHistory) && order.statusHistory.length
      ? order.statusHistory
      : [{ status: order.status || 'Order Placed', at: order.createdAt || new Date().toISOString() }],
  }))

  res.json({ success: true, orders: normalized })
}

// Kitchen status changes use the same validated order-status flow as Order Management.
export async function updateKitchenOrderStatus(req, res) {
  return updateAdminOrderStatus(req, res)
}

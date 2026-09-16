import Order from '../models/Order.js'
import { buildInvoicePdf } from '../utils/invoicePdf.js'

export async function downloadInvoice(req, res) {
  const orderId = String(req.params.orderId || '').trim()
  if (!orderId) return res.status(400).json({ success: false, message: 'Order ID is required.' })

  const isAdmin = req.user?.role === 'admin'
  const email = String(req.user?.email || '').trim().toLowerCase()
  const filter = isAdmin
    ? { orderId }
    : { orderId, $or: [{ userId: req.user._id }, { customerEmail: email }, { customerKey: `email:${email}` }] }

  const order = await Order.findOne(filter).lean()
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })

  const pdf = buildInvoicePdf(order)
  const safeId = order.orderId.replace(/[^a-zA-Z0-9_-]/g, '-')
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="RDX-Invoice-${safeId}.pdf"`,
    'Content-Length': pdf.length,
    'Cache-Control': 'no-store',
  })
  return res.status(200).send(pdf)
}

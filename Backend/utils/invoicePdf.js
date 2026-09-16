const esc = (value) => String(value ?? '')
  .replace(/\\/g, '\\\\')
  .replace(/\(/g, '\\(')
  .replace(/\)/g, '\\)')
  .replace(/[^\x20-\x7E]/g, '?')

const money = (value) => `Rs. ${Number(value || 0).toFixed(2)}`

export function buildInvoicePdf(order) {
  const items = Array.isArray(order.items) ? order.items : []
  const subtotal = Number(order.subtotal ?? items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0))
  const couponDiscount = Number(order.couponDiscount || 0)
  const offerDiscount = Number(order.offerDiscount || 0)
  const promotionDiscount = order.couponCode ? couponDiscount : offerDiscount
  const legacyDiscount = (!order.couponCode && !order.offerTitle) ? Number(order.discount || 0) : 0
  const loyaltyPoints = Number(order.loyaltyPointsRedeemed || 0)
  const loyaltyDiscount = Math.min(Math.max(0, Number(order.loyaltyDiscount ?? (loyaltyPoints / 10))), Math.max(0, subtotal - promotionDiscount - legacyDiscount))
  const total = Math.max(0, Number(order.total ?? (subtotal - promotionDiscount - legacyDiscount - loyaltyDiscount)))
  const payment = ({ cash: 'Cash', online: 'Online', paid: 'Paid', pending: 'Pending' }[order.paymentStatus] || 'Pending')

  const lines = []
  const add = (text, x, y, size = 10, bold = false) => lines.push({ text: String(text), x, y, size, bold })
  let y = 790
  add('RDX FAST FOOD', 50, y, 20, true)
  add('Customer Invoice', 50, y - 18, 10)
  add(`Order ID: ${order.orderId || 'N/A'}`, 370, y - 2, 10, true)
  add(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : 'N/A'}`, 370, y - 18, 9)
  y -= 55

  add('CUSTOMER', 50, y, 8, true)
  add(order.name || 'Customer', 50, y - 16, 10, true)
  add(order.customerEmail || '', 50, y - 31, 9)
  add(order.phone || '', 50, y - 46, 9)

  add('ORDER TYPE', 330, y, 8, true)
  add(order.orderType === 'delivery' ? 'Delivery' : 'Pickup', 330, y - 16, 10, true)
  if (order.address) add(order.address, 330, y - 31, 9)
  if (order.landmark) add(`Landmark: ${order.landmark}`, 330, y - 46, 9)
  if (order.pincode) add(`Pincode: ${order.pincode}`, 330, y - 61, 9)
  y -= 90

  lines.push({ rule: true, y })
  y -= 22
  add('ITEM', 50, y, 9, true)
  add('QTY', 335, y, 9, true)
  add('PRICE', 380, y, 9, true)
  add('AMOUNT', 465, y, 9, true)
  y -= 20

  for (const item of items) {
    const name = String(item.name || 'Item').slice(0, 42)
    const qty = Number(item.quantity || 0)
    const price = Number(item.price || 0)
    add(name, 50, y, 9)
    add(String(qty), 335, y, 9)
    add(money(price), 380, y, 9)
    add(money(price * qty), 465, y, 9)
    y -= 18
    if (y < 180) break
  }

  lines.push({ rule: true, y: y + 6 })
  y -= 18
  add(`Subtotal: ${money(subtotal)}`, 380, y, 10)
  if (order.couponCode && couponDiscount > 0) { y -= 17; add(`Coupon (${order.couponCode}): -${money(couponDiscount)}`, 300, y, 9) }
  if (order.offerTitle && offerDiscount > 0) { y -= 17; add(`Offer (${order.offerTitle}): -${money(offerDiscount)}`, 300, y, 9) }
  if (loyaltyPoints > 0 || loyaltyDiscount > 0) { y -= 17; add(`Loyalty Points (${loyaltyPoints}): -${money(loyaltyDiscount)}`, 280, y, 9) }
  if (legacyDiscount > 0) { y -= 17; add(`Discount: -${money(legacyDiscount)}`, 380, y, 9) }
  y -= 22
  add(`TOTAL: ${money(total)}`, 380, y, 13, true)
  y -= 22
  add(`Bill Paid: ${payment}`, 380, y, 10, true)
  y -= 38
  add('Thank you for ordering from RDX Fast Food.', 50, y, 9)
  add('Fresh. Fast. Flavorful.', 50, y - 15, 9)

  const content = ['BT']
  for (const line of lines) {
    if (line.rule) content.push(`0.75 w 50 ${line.y} m 545 ${line.y} l S`)
    else content.push(`0 g ${line.bold ? '/F2' : '/F1'} ${line.size} Tf 1 0 0 1 ${line.x} ${line.y} Tm (${esc(line.text)}) Tj`)
  }
  content.push('ET')
  const stream = content.join('\n')

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'ascii')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n'
  const offsets = [0]
  objects.forEach((object, index) => {
    offsets[index + 1] = Buffer.byteLength(pdf, 'binary')
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`
  })
  const xrefOffset = Buffer.byteLength(pdf, 'binary')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`
  return Buffer.from(pdf, 'binary')
}

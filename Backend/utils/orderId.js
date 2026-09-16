import crypto from 'node:crypto'
export function generateOrderId() {
  return `RDX-${crypto.randomInt(100000, 1000000)}`
}

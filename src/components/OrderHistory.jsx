import { FaClipboardList, FaTimes, FaMapMarkerAlt, FaMotorcycle, FaStore, FaRedo, FaChevronDown, FaChevronUp, FaStar, FaPen, FaFileInvoice } from 'react-icons/fa'
import { useState } from 'react'

const OrderHistory = ({ isOpen, onClose, orders = [], onReorder, reviews = [], onReview, onTrack, onInvoice }) => {
  const [expandedOrder, setExpandedOrder] = useState(null)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full px-4 py-6 sm:py-10">
        <div className="max-w-4xl mx-auto bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-800">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Order History</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close order history" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors">
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="p-5 sm:p-8">
            {orders.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                  <FaClipboardList className="text-primary text-2xl" aria-hidden="true" />
                </div>
                <h3 className="text-xl font-semibold text-white mt-5">No orders yet</h3>
                <p className="text-sm text-gray-500 mt-2">Your completed orders will appear here.</p>
                <button type="button" onClick={onClose} className="mt-6 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform">
                  Browse Menu
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  const isExpanded = expandedOrder === order.id
                  const subtotal = Number(order.subtotal || 0)
                  const promotionDiscount = order.couponCode
                    ? Number(order.couponDiscount || 0)
                    : Number(order.offerDiscount || 0)
                  const loyaltyDiscount = Number(order.loyaltyDiscount || 0)
                  const calculatedTotal = Math.max(0, subtotal - promotionDiscount - loyaltyDiscount)
                  const displayTotal = Number.isFinite(Number(order.total))
                    ? Number(order.total)
                    : calculatedTotal
                  const displayDate = (() => {
                    const rawDate = order.createdAt || order.date
                    if (!rawDate) return 'Date unavailable'
                    const parsedDate = rawDate instanceof Date ? rawDate : new Date(rawDate)
                    if (Number.isNaN(parsedDate.getTime())) return String(order.date || 'Date unavailable')
                    return parsedDate.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                  })()
                  return (
                    <div key={order.id} className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
                      <button type="button" onClick={() => setExpandedOrder(isExpanded ? null : order.id)} className="w-full text-left p-4 sm:p-5 hover:bg-white/[0.02] transition-colors" aria-expanded={isExpanded}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-white font-semibold">{order.id}</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{order.status || 'Order Placed'}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">{displayDate}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-lg font-bold text-white">₹{displayTotal}</p>
                            <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1">
                              {order.orderType === 'delivery' ? <FaMotorcycle aria-hidden="true" /> : <FaStore aria-hidden="true" />}
                              {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                          <span>{order.items.reduce((total, item) => total + item.quantity, 0)} item{order.items.reduce((total, item) => total + item.quantity, 0) !== 1 ? 's' : ''}</span>
                          <span className="text-gray-400 flex items-center gap-2">{isExpanded ? 'Hide details' : 'View details'} {isExpanded ? <FaChevronUp /> : <FaChevronDown />}</span>
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t border-gray-800 p-4 sm:p-5 space-y-5">
                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={`${order.id}-${item.id}`} className="flex items-center justify-between gap-4">
                                <div className="min-w-0">
                                  <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                  <p className="text-xs text-gray-500 mt-1">₹{item.price} × {item.quantity}</p>
                                </div>
                                <p className="text-white font-semibold shrink-0">₹{item.price * item.quantity}</p>
                              </div>
                            ))}
                          </div>

                          {order.orderType === 'delivery' && order.address && (
                            <div className="rounded-xl bg-gray-950 border border-gray-800 p-4">
                              <div className="flex items-start gap-3">
                                <FaMapMarkerAlt className="text-primary mt-1 shrink-0" aria-hidden="true" />
                                <div>
                                  <p className="text-sm font-semibold text-white">Delivery Address</p>
                                  <p className="text-sm text-gray-400 mt-1">{order.address}</p>
                                  {order.landmark && <p className="text-xs text-gray-500 mt-1">Landmark: {order.landmark}</p>}
                                  {order.pincode && <p className="text-xs text-gray-500 mt-1">Pincode: {order.pincode}</p>}
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="border-t border-gray-800 pt-4 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Subtotal</span>
                              <span className="text-gray-300">₹{subtotal}</span>
                            </div>
                            {order.couponCode && <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Coupon ({order.couponCode})</span><span className="text-green-400">-₹{Number(order.couponDiscount || 0)}</span></div>}
                            {order.offerTitle && <div className="flex items-center justify-between text-sm"><span className="text-gray-500">Offer ({order.offerTitle})</span><span className="text-green-400">-₹{Number(order.offerDiscount || 0)}</span></div>}
                            {loyaltyDiscount > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">Loyalty Points ({Number(order.loyaltyPointsRedeemed || 0)})</span>
                                <span className="text-green-400">-₹{loyaltyDiscount}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-base font-semibold">
                              <span className="text-gray-300">Total</span>
                              <span className="text-white">₹{displayTotal}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-500">Bill Paid</span>
                              <span className="text-gray-300">{({ cash: 'Cash', online: 'Online', pending: 'Pending' }[order.paymentStatus] || 'Pending')}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
                              <p className="text-xs text-gray-600">Order details saved to this account.</p>
                              <div className="flex flex-col sm:flex-row gap-3">
                                <button type="button" onClick={() => onTrack?.(order)} className="border border-primary/50 text-primary px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/10 transition-colors">
                                  📦 Track Order
                                </button>
                                <button type="button" onClick={() => onInvoice?.(order)} className="border border-gray-700 bg-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 hover:border-primary/60 hover:text-primary transition-colors">
                                  <FaFileInvoice aria-hidden="true" /> Invoice
                                </button>
                                <button type="button" onClick={() => onReview?.(order)} className="border border-gray-700 bg-gray-900 px-5 py-2.5 rounded-full text-sm font-semibold text-white flex items-center justify-center gap-2 hover:border-primary/60 hover:text-primary transition-colors">
                                  {reviews.some((review) => review.orderId === order.id) ? <FaPen aria-hidden="true" /> : <FaStar aria-hidden="true" />}
                                  {reviews.some((review) => review.orderId === order.id) ? 'Edit Review' : 'Rate Order'}
                                </button>
                                <button type="button" onClick={() => onReorder?.(order)} className="bg-gradient-to-r from-primary to-secondary px-5 py-2.5 rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:scale-[1.01] transition-transform">
                                  <FaRedo aria-hidden="true" /> Reorder
                                </button>
                              </div>
                            </div>
                            {reviews.find((review) => review.orderId === order.id) && (() => {
                              const review = reviews.find((item) => item.orderId === order.id)
                              return (
                                <div className="rounded-xl bg-gray-950 border border-gray-800 p-4">
                                  <div className="flex items-center gap-2">
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((star) => <FaStar key={star} className={star <= review.rating ? 'text-primary' : 'text-gray-700'} aria-hidden="true" />)}
                                    </div>
                                    <span className="text-xs text-gray-500">Your review</span>
                                  </div>
                                  <p className="text-sm text-gray-400 mt-3">{review.comment}</p>
                                  <p className="text-xs text-gray-600 mt-2">{review.date}</p>
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderHistory

import { useEffect, useMemo, useState } from 'react'
import { FaArrowLeft, FaDownload, FaTimes, FaSearch } from 'react-icons/fa'
import { api } from '../api'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const Invoice = ({ isOpen, onBack, onClose, order }) => {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(order || null)
  const [query, setQuery] = useState('')
  const [downloadError, setDownloadError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setSelectedOrder(order || null)
    setQuery('')
    setDownloadError('')
    if (!order) {
      api.orders.adminList().then(({ orders: adminOrders = [] }) => {
        setOrders(adminOrders.map((item) => ({ ...item, id: item.id || item.orderId, date: item.date || (item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : 'Recently') })))
      }).catch(() => setOrders([]))
    } else {
      setOrders([])
    }
  }, [isOpen, order])

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((item) =>
      [item.id, item.customerEmail, item.phone, item.name, item.date]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q))
    )
  }, [orders, query])

  if (!isOpen) return null

  const invoiceItems = Array.isArray(selectedOrder?.items) ? selectedOrder.items : []
  const invoiceSubtotal = Number(selectedOrder?.subtotal ?? invoiceItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0))
  const invoiceCouponDiscount = Number(selectedOrder?.couponDiscount || 0)
  const invoiceOfferDiscount = Number(selectedOrder?.offerDiscount || 0)
  const invoicePromotionDiscount = selectedOrder?.couponCode ? invoiceCouponDiscount : invoiceOfferDiscount
  const invoiceLoyaltyPoints = Number(selectedOrder?.loyaltyPointsRedeemed || 0)
  const invoiceLoyaltyDiscount = Math.min(
    Math.max(0, Number(selectedOrder?.loyaltyDiscount ?? (invoiceLoyaltyPoints / 10))),
    Math.max(0, invoiceSubtotal - invoicePromotionDiscount)
  )
  const invoiceLegacyDiscount = Number(selectedOrder?.discount || 0)
  const invoiceLegacyPromotionDiscount = (!selectedOrder?.couponCode && !selectedOrder?.offerTitle) ? invoiceLegacyDiscount : 0
  const invoiceTotal = Math.max(0, invoiceSubtotal - invoicePromotionDiscount - invoiceLegacyPromotionDiscount - invoiceLoyaltyDiscount)

  const escapePdfText = (value) => String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')

  const downloadInvoice = async () => {
    if (!selectedOrder) return
    setDownloadError('')
    try {
      const orderId = selectedOrder.orderId || selectedOrder.id
      const blob = await api.invoices.download(orderId)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `RDX-Invoice-${orderId || 'Order'}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      setDownloadError(error.message || 'Unable to download invoice.')
    }
  }

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      html,
      body {
        background: #fff !important;
      }

      body * {
        visibility: hidden !important;
      }

      .rdx-invoice-document,
      .rdx-invoice-document * {
        visibility: visible !important;
      }

      .rdx-invoice-document {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        min-height: 0 !important;
        margin: 0 !important;
        padding: 12mm !important;
        overflow: visible !important;
        background: #fff !important;
        color: #111 !important;
        box-shadow: none !important;
        border: 0 !important;
      }

      .rdx-invoice-document * {
        color: #111 !important;
        border-color: #d1d5db !important;
      }

      .rdx-invoice-document table,
      .rdx-invoice-document .grid {
        break-inside: avoid;
      }

      .rdx-invoice-document .text-gray-500 {
        color: #6b7280 !important;
      }
    }
  `

  return (
    <>
      <style>{printStyles}</style>
      <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
          {!selectedOrder ? (
            <>
              <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Invoice Generation</h2>
                  <p className="text-sm text-gray-500 mt-1">Select an order before opening the invoice.</p>
                </div>
                <div className="flex items-center gap-2"><button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close invoice generation"><FaTimes /></button></div>
              </header>
              <main className="p-5 sm:p-7">
                <div className="relative mb-5">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Order ID, customer, email..." className="w-full rounded-2xl border border-gray-800 bg-gray-900 text-white pl-11 pr-4 py-3 outline-none focus:border-primary/60" />
                </div>
                {filteredOrders.length === 0 ? (
                  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-10 text-center text-gray-500">No orders available.</div>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((item) => (
                      <button key={item.id} type="button" onClick={() => setSelectedOrder(item)} className="w-full text-left rounded-2xl border border-gray-800 bg-gray-900/60 hover:border-primary/50 hover:bg-gray-900 px-4 sm:px-5 py-4 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <p className="text-white font-semibold">{item.id}</p>
                            <p className="text-xs text-gray-500 mt-1">{item.name || item.customerEmail || 'Customer'} · {item.date || 'Recently'}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{item.status || 'Order Placed'}</span>
                            <span className="text-white font-semibold">{money(item.total ?? item.subtotal)}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </main>
            </>
          ) : (
            <>
              <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 bg-gray-950/95 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to order selection"><FaArrowLeft /></button>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Invoice</h2>
                    <p className="text-sm text-gray-500 mt-1">Invoice for order {selectedOrder.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={downloadInvoice} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-sm font-semibold"><FaDownload /> Download Invoice</button>
                  <button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close invoice"><FaTimes /></button>
                </div>
              </header>
              {downloadError && <div className="px-5 sm:px-7 py-2 text-sm text-red-400 bg-red-950/30 border-b border-red-900/40">{downloadError}</div>}
              <main id="rdx-invoice" className="rdx-invoice-document p-6 sm:p-8 lg:p-10 text-gray-900 bg-white print:min-h-screen">
                <div className="flex justify-between gap-6 border-b pb-5">
                  <div><h1 className="text-3xl font-black">RDX FAST FOOD</h1><p className="text-sm text-gray-500">Customer Invoice</p></div>
                  <div className="text-right"><p className="text-sm text-gray-500">Invoice / Order ID</p><p className="font-bold">{selectedOrder.id}</p><p className="text-sm text-gray-500 mt-1">{selectedOrder.date || 'Recently'}</p></div>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 py-6 border-b">
                  <div><p className="text-xs uppercase text-gray-500">Customer</p><p className="font-semibold mt-1">{selectedOrder.name || 'Customer'}</p><p>{selectedOrder.customerEmail || ''}</p><p>{selectedOrder.phone || ''}</p></div>
                  <div><p className="text-xs uppercase text-gray-500">Order Type</p><p className="font-semibold mt-1">{selectedOrder.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</p>{selectedOrder.address && <p className="mt-1">{selectedOrder.address}</p>}{selectedOrder.landmark && <p>Landmark: {selectedOrder.landmark}</p>}{selectedOrder.pincode && <p>Pincode: {selectedOrder.pincode}</p>}</div>
                  <div><p className="text-xs uppercase text-gray-500">Bill Paid</p><p className="font-semibold mt-1">{({ cash: 'Cash', online: 'Online', pending: 'Pending' }[selectedOrder.paymentStatus] || 'Pending')}</p><p className="text-xs text-gray-500 mt-1">Payment status</p></div>
                </div>
                <div className="py-6 border-b">
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-sm font-semibold border-b pb-3"><span>Item</span><span>Qty</span><span>Price</span><span>Amount</span></div>
                  {(selectedOrder.items || []).map((item) => <div key={item.id || item.name} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-sm py-3"><span>{item.name}</span><span>{item.quantity}</span><span>{money(item.price)}</span><span>{money(Number(item.price || 0) * Number(item.quantity || 0))}</span></div>)}
                </div>
                <div className="ml-auto max-w-sm py-6 space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>{money(invoiceSubtotal)}</span></div>
                  {invoiceCouponDiscount > 0 && selectedOrder.couponCode && <div className="flex justify-between"><span>Coupon ({selectedOrder.couponCode})</span><span className="text-green-600">-{money(invoiceCouponDiscount)}</span></div>}
                  {invoiceOfferDiscount > 0 && selectedOrder.offerTitle && <div className="flex justify-between"><span>Offer ({selectedOrder.offerTitle})</span><span className="text-green-600">-{money(invoiceOfferDiscount)}</span></div>}
                  {(invoiceLoyaltyPoints > 0 || invoiceLoyaltyDiscount > 0) && <div className="flex justify-between"><span>Loyalty Points ({invoiceLoyaltyPoints})</span><span className="text-green-600">-{money(invoiceLoyaltyDiscount)}</span></div>}
                  {!selectedOrder.couponCode && !selectedOrder.offerTitle && invoiceLegacyDiscount > 0 && <div className="flex justify-between"><span>Discount</span><span>-{money(invoiceLegacyDiscount)}</span></div>}
                  <div className="flex justify-between text-lg font-bold border-t pt-3"><span>Total</span><span>{money(invoiceTotal)}</span></div>
                  <div className="flex justify-between border-t pt-3 font-semibold"><span>Bill Paid</span><span>{({ cash: 'Cash', online: 'Online', pending: 'Pending' }[selectedOrder.paymentStatus] || 'Pending')}</span></div>
                </div>
              </main>
            </>
          )}
        </div>
      </div>
    </div>
    </>
  )
}

export default Invoice

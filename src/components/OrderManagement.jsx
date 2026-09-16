import { useEffect, useMemo, useState } from 'react'
import { FaTimes, FaArrowLeft, FaSearch, FaSyncAlt, FaEye, FaCheck, FaTruck, FaUtensils } from 'react-icons/fa'
import { api } from '../api'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const DELIVERY_STATUSES = ['Order Placed', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered']
const PICKUP_STATUSES = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Picked Up']

const getStatuses = (order) => order?.orderType === 'pickup' ? PICKUP_STATUSES : DELIVERY_STATUSES

const statusClass = (status) => {
  if (['Delivered', 'Picked Up'].includes(status)) return 'bg-green-500/10 text-green-300 border-green-500/20'
  if (['Preparing', 'Ready', 'Ready for Pickup', 'Out for Delivery'].includes(status)) return 'bg-primary/10 text-primary border-primary/20'
  return 'bg-gray-800 text-gray-300 border-gray-700'
}

const OrderManagement = ({ isOpen, onBack, onClose }) => {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.orders.adminList()
      const serverOrders = Array.isArray(result.orders) ? result.orders.map((order) => ({
        ...order,
        id: order.orderId,
        date: order.date || (order.createdAt ? new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recently'),
      })) : []
      setOrders(serverOrders)
    } catch (err) {
      setOrders([])
      setError(err.message || 'Unable to load customer orders from the backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) loadOrders()
  }, [isOpen, refreshKey])

  useEffect(() => {
    const sync = () => { if (isOpen) loadOrders() }
    window.addEventListener('rdx-order-updated', sync)
    return () => window.removeEventListener('rdx-order-updated', sync)
  }, [isOpen])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesSearch = !query || [order.id, order.customerEmail, order.address, order.phone]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
      const matchesStatus = statusFilter === 'All' || (order.status || 'Order Placed') === statusFilter
      const matchesType = typeFilter === 'All' || (order.orderType || 'delivery') === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [orders, search, statusFilter, typeFilter])

  const updateStatus = async (order, status) => {
    if (status === (order.status || 'Order Placed')) return
    try {
      const result = await api.orders.adminUpdateStatus(order.id, status)
      const savedOrder = result.order ? {
        ...result.order,
        id: result.order.orderId,
        date: result.order.createdAt ? new Date(result.order.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : order.date,
      } : { ...order, status }
      const nextOrders = orders.map((item) => item.id === order.id ? savedOrder : item)
      setOrders(nextOrders)
      setSelectedOrder((current) => current?.id === order.id ? savedOrder : current)
      window.dispatchEvent(new CustomEvent('rdx-order-updated'))

    } catch (err) {
      setError(err.message || 'Unable to update order status.')
      await loadOrders()
    }
  }

  const completeOrder = (order) => {
    const finalStatus = order.orderType === 'pickup' ? 'Picked Up' : 'Delivered'
    updateStatus(order, finalStatus)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 z-20">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Order Management</h2>
              <p className="text-sm text-gray-500 mt-1">Review customer orders and update their backend tracking status.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Refresh orders"><FaSyncAlt /></button>
              <div className="flex items-center gap-2"><button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close order management"><FaTimes /></button></div>
            </div>
          </header>

          <main className="p-5 sm:p-7 space-y-5">
            <section className="grid grid-cols-1 lg:grid-cols-[1fr_180px_160px] gap-3">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID, customer email, phone..." className="input-field pl-11" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                <option value="All">All statuses</option>
                {DELIVERY_STATUSES.slice(1).map((status) => <option key={status} value={status}>{status}</option>)}
                <option value="Ready for Pickup">Ready for Pickup</option>
                <option value="Picked Up">Picked Up</option>
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
                <option value="All">All order types</option>
                <option value="delivery">Delivery</option>
                <option value="pickup">Pickup</option>
              </select>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Orders</h3>
                  <p className="text-xs text-gray-500 mt-1">{filteredOrders.length} of {orders.length} orders shown</p>
                </div>
              </div>

              {loading ? (
                <div className="p-12 text-center text-gray-500">Loading customer orders from MongoDB...</div>
              ) : error ? (
                <div className="p-10 text-center text-red-300">{error}</div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No orders match the selected filters.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="p-5 flex flex-col xl:flex-row xl:items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-bold text-white">{order.id}</h4>
                          <span className={`text-[11px] px-2.5 py-1 rounded-full border ${statusClass(order.status || 'Order Placed')}`}>{order.status || 'Order Placed'}</span>
                          <span className="text-[11px] px-2.5 py-1 rounded-full border border-gray-700 text-gray-400">{order.orderType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                        </div>
                        <p className="text-sm text-gray-400 mt-2">{order.customerEmail || 'Guest'} · {order.date || 'Recently'}</p>
                        <p className="text-xs text-gray-600 mt-1">{order.items?.length || 0} item types · {money(order.total ?? order.subtotal)}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button type="button" onClick={() => setSelectedOrder(order)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/40 text-sm"><FaEye /> Details</button>
                        <select value={order.status || 'Order Placed'} onChange={(e) => updateStatus(order, e.target.value)} className="status-select">
                          {getStatuses(order).map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                        {!['Delivered', 'Picked Up'].includes(order.status) && <button type="button" onClick={() => completeOrder(order)} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-sm font-semibold"><FaCheck /> Complete</button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[170] bg-black/70 flex items-center justify-center p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
          <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Order Details</p>
                <h3 className="text-2xl font-bold text-white mt-1">{selectedOrder.id}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.date}</p>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 flex items-center justify-center"><FaTimes /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
              <Info label="Customer" value={selectedOrder.customerEmail || 'Guest'} />
              <Info label="Order Type" value={selectedOrder.orderType === 'pickup' ? 'Pickup' : 'Delivery'} />
              <Info label="Status" value={selectedOrder.status || 'Order Placed'} />
              <Info label="Total" value={money(selectedOrder.total ?? selectedOrder.subtotal)} />
            </div>

            <div className="mt-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
              <h4 className="font-bold text-white mb-3">Items</h4>
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item) => (
                  <div key={`${selectedOrder.id}-${item.id}`} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-300">{item.name} × {item.quantity}</span>
                    <span className="text-white font-semibold">{money(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.orderType === 'delivery' && selectedOrder.address && (
              <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
                <h4 className="font-bold text-white mb-2">Delivery Address</h4>
                <p className="text-sm text-gray-400">{selectedOrder.address}</p>
                {selectedOrder.landmark && <p className="text-sm text-gray-500 mt-1">Landmark: {selectedOrder.landmark}</p>}
                {selectedOrder.pincode && <p className="text-sm text-gray-500 mt-1">Pincode: {selectedOrder.pincode}</p>}
              </div>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {getStatuses(selectedOrder).map((status) => (
                <button key={status} type="button" onClick={() => updateStatus(selectedOrder, status)} className={`px-4 py-2 rounded-full border text-sm ${selectedOrder.status === status ? 'bg-primary/15 border-primary/30 text-primary' : 'border-gray-700 text-gray-400 hover:text-white'}`}>
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.input-field,.status-select{width:100%;background:#111827;border:1px solid #374151;border-radius:.75rem;padding:.7rem .9rem;color:#fff;outline:none}.input-field:focus,.status-select:focus{border-color:#f97316}.status-select{width:auto;min-width:160px}`}</style>
    </div>
  )
}

const Info = ({ label, value }) => (
  <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-3">
    <p className="text-[11px] uppercase tracking-wider text-gray-600">{label}</p>
    <p className="text-sm text-white mt-1 break-words">{value}</p>
  </div>
)

export default OrderManagement

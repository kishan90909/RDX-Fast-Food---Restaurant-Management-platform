import { useEffect, useMemo, useState } from 'react'
import { FaTimes, FaArrowLeft, FaSyncAlt, FaUtensils, FaClock, FaCheck, FaArrowRight } from 'react-icons/fa'
import { api } from '../api'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const ACTIVE_STATUSES = ['Order Placed', 'Preparing', 'Ready', 'Ready for Pickup']

const getNextStatus = (order) => {
  if (order.orderType === 'pickup') {
    if ((order.status || 'Order Placed') === 'Order Placed') return 'Preparing'
    if ((order.status || '') === 'Preparing') return 'Ready for Pickup'
    return null
  }
  if ((order.status || 'Order Placed') === 'Order Placed') return 'Preparing'
  if ((order.status || '') === 'Preparing') return 'Ready'
  return null
}

const statusStyle = (status) => {
  if (status === 'Preparing') return 'bg-primary/10 border-primary/20 text-primary'
  if (status === 'Ready' || status === 'Ready for Pickup') return 'bg-green-500/10 border-green-500/20 text-green-300'
  return 'bg-gray-800 border-gray-700 text-gray-300'
}

const KitchenDashboard = ({ isOpen, onBack, onClose }) => {
  const [orders, setOrders] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)

  const loadOrders = async () => {
    try {
      const data = await api.kitchen.list()
      const backendOrders = Array.isArray(data?.orders) ? data.orders : []
      setOrders(backendOrders.map((order) => ({ ...order, id: order.orderId })))
    } catch (error) {
      setOrders([])
      window.alert(error.message || 'Unable to load kitchen orders.')
    }
  }

  useEffect(() => {
    if (!isOpen) return undefined
    loadOrders()
    const interval = window.setInterval(loadOrders, 10000)
    return () => window.clearInterval(interval)
  }, [isOpen, refreshKey])

  const kitchenOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.includes(order.status || 'Order Placed')),
    [orders]
  )

  const counts = useMemo(() => ({
    newOrders: kitchenOrders.filter((order) => (order.status || 'Order Placed') === 'Order Placed').length,
    preparing: kitchenOrders.filter((order) => order.status === 'Preparing').length,
    ready: kitchenOrders.filter((order) => ['Ready', 'Ready for Pickup'].includes(order.status)).length,
  }), [kitchenOrders])

  const updateStatus = async (order, status) => {
    try {
      const data = await api.kitchen.updateStatus(order.orderId || order.id, status)
      const updated = data?.order
      if (updated) {
        setOrders((current) => current
          .map((item) => (item.id === (updated.orderId || updated.id)
            ? { ...updated, id: updated.orderId || updated.id }
            : item))
          .filter((item) => ACTIVE_STATUSES.includes(item.status || 'Order Placed')))
      } else {
        await loadOrders()
      }
    } catch (error) {
      window.alert(error.message || 'Unable to update kitchen order.')
    }
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[155] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 z-20">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 flex items-center gap-3"><FaUtensils className="text-primary" /> Kitchen Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Manage active kitchen orders from the frontend.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Refresh kitchen dashboard"><FaSyncAlt /></button>
              <div className="flex items-center gap-2"><button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close kitchen dashboard"><FaTimes /></button></div>
            </div>
          </header>

          <main className="p-5 sm:p-7 space-y-6">
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KitchenStat icon={<FaClock />} label="New Orders" value={counts.newOrders} />
              <KitchenStat icon={<FaUtensils />} label="Preparing" value={counts.preparing} />
              <KitchenStat icon={<FaCheck />} label="Ready" value={counts.ready} />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <KitchenColumn title="New Orders" status="Order Placed" orders={kitchenOrders.filter((order) => (order.status || 'Order Placed') === 'Order Placed')} actionLabel="Start Preparing" onAction={(order) => updateStatus(order, 'Preparing')} />
              <KitchenColumn title="Preparing" status="Preparing" orders={kitchenOrders.filter((order) => order.status === 'Preparing')} actionLabel="Mark Ready" onAction={(order) => updateStatus(order, order.orderType === 'pickup' ? 'Ready for Pickup' : 'Ready')} />
              <KitchenColumn title="Ready" status="Ready" orders={kitchenOrders.filter((order) => ['Ready', 'Ready for Pickup'].includes(order.status))} actionLabel="" onAction={() => {}} />
            </section>

            <section className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Backend Connected</p>
              <p className="text-sm text-gray-400 mt-1">Kitchen orders and status changes are synchronized with MongoDB. Customer tracking notifications are created when the kitchen status changes.</p>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

const KitchenStat = ({ icon, label, value }) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 flex items-center justify-between">
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
      <p className="text-3xl font-bold text-white mt-2">{value}</p>
    </div>
    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">{icon}</div>
  </div>
)

const KitchenColumn = ({ title, orders, actionLabel, onAction }) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
    <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
      <h3 className="font-bold text-white">{title}</h3>
      <span className="text-xs text-gray-500">{orders.length}</span>
    </div>
    <div className="p-4 space-y-3 min-h-[180px]">
      {orders.length === 0 ? (
        <div className="h-[150px] flex items-center justify-center text-sm text-gray-600">No orders</div>
      ) : orders.map((order) => (
        <div key={order.id} className="rounded-xl border border-gray-800 bg-gray-950/70 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-white">{order.id}</p>
              <p className="text-xs text-gray-500 mt-1">{order.orderType === 'pickup' ? '🏪 Pickup' : '🛵 Delivery'}</p>
            </div>
            <span className={`text-[10px] px-2 py-1 rounded-full border ${statusStyle(order.status || 'Order Placed')}`}>{order.status || 'Order Placed'}</span>
          </div>
          <div className="mt-3 space-y-1">
            {(order.items || []).map((item) => <p key={`${order.id}-${item.id}`} className="text-sm text-gray-300">{item.name} × {item.quantity}</p>)}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-white">{money(order.total ?? order.subtotal)}</span>
            {actionLabel && <button type="button" onClick={() => onAction(order)} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-primary to-secondary text-xs font-semibold"><FaArrowRight /> {actionLabel}</button>}
          </div>
        </div>
      ))}
    </div>
  </div>
)

export default KitchenDashboard

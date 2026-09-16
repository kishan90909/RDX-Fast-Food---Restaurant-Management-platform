import { useEffect, useMemo, useState } from 'react'
import { FaTimes, FaArrowLeft, FaClipboardList, FaRupeeSign, FaUsers, FaClock, FaArrowUp, FaSyncAlt } from 'react-icons/fa'
import { api } from '../api'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const AdminDashboard = ({ isOpen, onBack, onClose, onOpenOrders, onOpenMenu, onOpenKitchen, onOpenInventory, onOpenAnalytics, onOpenInvoice }) => {
  const [orders, setOrders] = useState([])
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

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total ?? order.subtotal ?? 0), 0)
    const customers = new Set(orders.map((order) => order.customerEmail).filter(Boolean)).size
    const active = orders.filter((order) => !['Delivered', 'Picked Up'].includes(order.status)).length
    return { totalRevenue, customers, active }
  }, [orders])

  const recentOrders = orders.slice(0, 6)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[130] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 bg-gray-950/95 sticky top-0 z-10">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Admin Dashboard</h2>
              <p className="text-sm text-gray-500 mt-1">Live customer orders from MongoDB</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors" aria-label="Refresh dashboard">
                <FaSyncAlt aria-hidden="true" />
              </button>
              <button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors" aria-label="Back to website"><FaArrowLeft aria-hidden="true" /></button>
              <button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors" aria-label="Close admin dashboard">
                <FaTimes aria-hidden="true" />
              </button>
            </div>
          </header>

          <main className="p-5 sm:p-7 lg:p-8 space-y-7">
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard icon={<FaClipboardList />} label="Total Orders" value={orders.length} note="All saved orders" />
              <StatCard icon={<FaRupeeSign />} label="Total Revenue" value={money(stats.totalRevenue)} note="From saved orders" />
              <StatCard icon={<FaUsers />} label="Customers" value={stats.customers} note="Unique customer emails" />
              <StatCard icon={<FaClock />} label="Active Orders" value={stats.active} note="Not completed" />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-800">
                  <div>
                    <h3 className="text-lg font-bold text-white">Recent Orders</h3>
                    <p className="text-xs text-gray-500 mt-1">Latest customer orders from the backend database</p>
                  </div>
                  <button type="button" onClick={onOpenOrders} className="text-sm text-primary hover:text-white transition-colors font-semibold">View all</button>
                </div>
                {recentOrders.length === 0 ? (
                  <div className="px-5 py-12 text-center text-gray-500">No orders available yet.</div>
                ) : (
                  <div className="divide-y divide-gray-800">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate">{order.id}</p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{order.customerEmail || 'Guest'} · {order.date || 'Recently'}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">{order.status || 'Order Placed'}</span>
                          <div className="flex items-center gap-3"><span className="text-white font-semibold">{money(order.total ?? order.subtotal)}</span><button type="button" onClick={() => onOpenInvoice(order)} className="text-xs text-primary hover:text-white transition-colors font-semibold">Select</button></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
                <h3 className="text-lg font-bold text-white">Version 4 Modules</h3>
                <p className="text-xs text-gray-500 mt-1">Frontend modules will be enabled step by step.</p>
                <div className="mt-5 space-y-3">
                  <ModuleRow title="Admin Dashboard" status="Active" />
                  <button type="button" onClick={onOpenMenu} className="w-full text-left"><ModuleRow title="Menu Management" status="Open" /></button>
                  <button type="button" onClick={onOpenOrders} className="w-full text-left"><ModuleRow title="Order Management" status="Open" /></button>
                  <button type="button" onClick={onOpenKitchen} className="w-full text-left"><ModuleRow title="Kitchen Dashboard" status="Open" /></button>
                  <button type="button" onClick={onOpenInventory} className="w-full text-left"><ModuleRow title="Inventory" status="Open" /></button>
                  <button type="button" onClick={onOpenAnalytics} className="w-full text-left"><ModuleRow title="Analytics" status="Open" /></button>
                  <button type="button" onClick={() => onOpenInvoice()} className="w-full text-left"><ModuleRow title="Invoice Generation" status={orders.length ? "Select Order" : "No orders"} muted={!orders.length} /></button>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-5 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Frontend only</p>
                <h3 className="text-xl font-bold text-white mt-1">Ready for the next management module</h3>
                <p className="text-sm text-gray-400 mt-1">Orders are loaded from MongoDB through the backend.</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400"><FaArrowUp className="text-primary" /> Backend connected</div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, note }) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs uppercase tracking-wider text-gray-500">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-white mt-2">{value}</p>
        <p className="text-xs text-gray-600 mt-1">{note}</p>
      </div>
      <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">{icon}</div>
    </div>
  </div>
)

const ModuleRow = ({ title, status, muted = false }) => (
  <div className="flex items-center justify-between gap-3 rounded-xl bg-gray-950/70 border border-gray-800 px-4 py-3">
    <span className={`text-sm ${muted ? 'text-gray-500' : 'text-white font-medium'}`}>{title}</span>
    <span className={`text-[11px] px-2.5 py-1 rounded-full border ${muted ? 'text-gray-600 border-gray-800' : 'text-primary border-primary/20 bg-primary/10'}`}>{status}</span>
  </div>
)

export default AdminDashboard

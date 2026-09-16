import { useEffect, useMemo, useState } from 'react'
import { FaBoxOpen, FaExclamationTriangle, FaPlus, FaMinus, FaSearch, FaTimes, FaArrowLeft, FaSyncAlt, FaSave } from 'react-icons/fa'
import { api } from '../api'

const DEFAULT_THRESHOLD = 5

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const InventoryManagement = ({ isOpen, onBack, onClose }) => {
  const [inventory, setInventory] = useState({})
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [filter, setFilter] = useState('All')
  const [refreshKey, setRefreshKey] = useState(0)

  const load = async () => {
    try {
      const response = await api.inventory.list()
      const next = {}
      ;(response.items || []).forEach((item) => {
        const key = item.id || item.itemId
        next[key] = { ...item, id: item.id || item.itemId, updatedAt: item.updatedAt || item.updatedAt }
      })
      setInventory(next)
    } catch (error) {
      setInventory({})
      if (isOpen) window.alert(error.message || 'Unable to load inventory from the server.')
    }
  }

  useEffect(() => {
    if (!isOpen) return
    load()
    return undefined
  }, [isOpen, refreshKey])

  const updateItem = async (key, patch) => {
    const current = inventory[key]
    if (!current?.id) return
    try {
      const response = await api.inventory.update(current.id, patch)
      const updated = response.item || { ...current, ...patch }
      setInventory((prev) => ({ ...prev, [key]: { ...prev[key], ...updated } }))
    } catch (error) {
      window.alert(error.message || 'Unable to update inventory.')
    }
  }

  const adjustStock = async (key, amount) => {
    const current = inventory[key]
    if (!current?.id) return
    try {
      const response = await api.inventory.adjust(current.id, amount)
      const updated = response.item
      setInventory((prev) => ({ ...prev, [key]: { ...prev[key], ...updated } }))
    } catch (error) {
      window.alert(error.message || 'Unable to adjust inventory.')
    }
  }

  const categories = useMemo(() => ['All', ...new Set(Object.values(inventory).map((item) => item.category).filter(Boolean))], [inventory])

  const items = useMemo(() => {
    const query = search.trim().toLowerCase()
    return Object.entries(inventory)
      .map(([key, item]) => ({ key, ...item }))
      .filter((item) => category === 'All' || item.category === category)
      .filter((item) => !query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query))
      .filter((item) => {
        const stock = Number(item.stock || 0)
        const threshold = Number(item.lowStockThreshold || DEFAULT_THRESHOLD)
        if (filter === 'Low Stock') return stock > 0 && stock <= threshold
        if (filter === 'Out of Stock') return stock <= 0
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [inventory, search, category, filter])

  const stats = useMemo(() => {
    const values = Object.values(inventory)
    return {
      totalItems: values.length,
      lowStock: values.filter((item) => Number(item.stock || 0) > 0 && Number(item.stock || 0) <= Number(item.lowStockThreshold || DEFAULT_THRESHOLD)).length,
      outOfStock: values.filter((item) => Number(item.stock || 0) <= 0).length,
      units: values.reduce((sum, item) => sum + Number(item.stock || 0), 0),
    }
  }, [inventory])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 z-20">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1 flex items-center gap-3"><FaBoxOpen className="text-primary" /> Inventory Management</h2>
              <p className="text-sm text-gray-500 mt-1">Track stock levels, low-stock alerts and item availability.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setRefreshKey((v) => v + 1)} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-400 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Refresh inventory"><FaSyncAlt /></button>
              <div className="flex items-center gap-2"><button type="button" onClick={onBack || onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Back to admin dashboard"><FaArrowLeft /></button><button type="button" onClick={onClose} className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center" aria-label="Close inventory"><FaTimes /></button></div>
            </div>
          </header>

          <main className="p-5 sm:p-7 space-y-6">
            <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <Stat label="Menu Items" value={stats.totalItems} />
              <Stat label="Units in Stock" value={stats.units} />
              <Stat label="Low Stock" value={stats.lowStock} alert={stats.lowStock > 0} />
              <Stat label="Out of Stock" value={stats.outOfStock} danger={stats.outOfStock > 0} />
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900/40 p-4 sm:p-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_190px_150px] gap-3">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search inventory..." className="input-field pl-11" />
                </div>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
                  {categories.map((value) => <option key={value}>{value}</option>)}
                </select>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field">
                  <option>All</option>
                  <option>Low Stock</option>
                  <option>Out of Stock</option>
                </select>
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {items.map((item) => {
                const stock = Number(item.stock || 0)
                const threshold = Number(item.lowStockThreshold || DEFAULT_THRESHOLD)
                const low = stock > 0 && stock <= threshold
                const out = stock <= 0
                return (
                  <article key={item.key} className={`rounded-2xl border p-5 ${out ? 'border-red-500/20 bg-red-500/5' : low ? 'border-yellow-500/20 bg-yellow-500/5' : 'border-gray-800 bg-gray-900/50'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500">{item.category}</p>
                        <h3 className="text-white font-bold mt-1 truncate">{item.name}</h3>
                      </div>
                      {out ? <span className="status danger">Out of Stock</span> : low ? <span className="status warning"><FaExclamationTriangle /> Low Stock</span> : <span className="status success">In Stock</span>}
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Current Stock</p>
                        <p className="text-3xl font-bold text-white mt-1">{stock}</p>
                        <p className="text-xs text-gray-600">{item.unit || 'items'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => adjustStock(item.key, -1)} disabled={stock <= 0} className="qty-btn disabled:opacity-30"><FaMinus /></button>
                        <button type="button" onClick={() => adjustStock(item.key, 1)} className="qty-btn"><FaPlus /></button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <label className="text-xs text-gray-500">Set Stock
                        <input type="number" min="0" value={stock} onChange={(e) => updateItem(item.key, { stock: Math.max(0, Number(e.target.value)) })} className="input-field mt-1" />
                      </label>
                      <label className="text-xs text-gray-500">Low Alert At
                        <input type="number" min="0" value={threshold} onChange={(e) => updateItem(item.key, { lowStockThreshold: Math.max(0, Number(e.target.value)) })} className="input-field mt-1" />
                      </label>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-3">Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString('en-IN') : '—'}</p>
                  </article>
                )
              })}
              {items.length === 0 && <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-dashed border-gray-800 p-12 text-center text-gray-500">No inventory items match your filters.</div>}
            </section>

            <section className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-5 flex items-start gap-3">
              <FaSave className="text-primary mt-1" />
              <div>
                <h3 className="text-white font-semibold">Stock is saved automatically</h3>
                <p className="text-sm text-gray-400 mt-1">Inventory changes are stored in MongoDB and are reflected in the customer menu. Orders automatically reduce the matching item stock.</p>
              </div>
            </section>
          </main>
        </div>
      </div>
      <style>{`.input-field{width:100%;background:#111827;border:1px solid #374151;border-radius:.75rem;padding:.7rem .9rem;color:#fff;outline:none}.input-field:focus{border-color:#f97316}.qty-btn{width:2.5rem;height:2.5rem;border-radius:9999px;background:#1f2937;color:#d1d5db;display:flex;align-items:center;justify-content:center}.qty-btn:hover{color:#f97316}.status{display:inline-flex;align-items:center;gap:.3rem;font-size:10px;padding:.3rem .55rem;border-radius:9999px}.status.success{background:rgba(34,197,94,.1);color:#86efac}.status.warning{background:rgba(234,179,8,.1);color:#fde047}.status.danger{background:rgba(239,68,68,.1);color:#fca5a5}`}</style>
    </div>
  )
}

const Stat = ({ label, value, alert, danger }) => (
  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4">
    <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
    <p className={`text-2xl sm:text-3xl font-bold mt-2 ${danger ? 'text-red-300' : alert ? 'text-yellow-300' : 'text-white'}`}>{value}</p>
  </div>
)

export default InventoryManagement

import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { FaTimes, FaArrowLeft, FaSyncAlt, FaRupeeSign, FaClipboardList, FaChartLine, FaUsers, FaShoppingBag, FaPercent, FaStar, FaClock, FaDownload } from 'react-icons/fa'

const money = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
const completed = ['Delivered', 'Picked Up']
const revenueOf = (o) => Number(o.total ?? Math.max(0, Number(o.subtotal || 0) - Number(o.couponDiscount || 0) - Number(o.offerDiscount || 0) - Number(o.loyaltyDiscount || 0)))
const discountOf = (o) => Number(o.couponDiscount || 0) + Number(o.offerDiscount || 0) + Number(o.loyaltyDiscount || 0)
const dateKey = (ts) => ts ? new Date(ts).toISOString().slice(0, 10) : 'unknown'
const dateLabel = (key) => key === 'unknown' ? 'Older' : new Date(`${key}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })

export default function Analytics({ isOpen, onBack, onClose }) {
  const [orders, setOrders] = useState([])
  const [catalog, setCatalog] = useState({})
  const [period, setPeriod] = useState('30')
  const [tab, setTab] = useState('overview')
  const [refresh, setRefresh] = useState(0)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await api.analytics.get(period)
      const serverOrders = Array.isArray(result.orders) ? result.orders : []
      const menu = {}
      ;(Array.isArray(result.menuItems) ? result.menuItems : []).forEach((item) => {
        const category = item.category || 'Other'
        if (!menu[category]) menu[category] = []
        menu[category].push({ id: item.itemId, name: item.name, category })
      })
      setOrders(serverOrders)
      setCatalog(menu)
    } catch (err) {
      setOrders([])
      setCatalog({})
      setError(err.message || 'Unable to load analytics from the backend.')
    } finally { setLoading(false) }
  }
  useEffect(() => { if (isOpen) load() }, [isOpen, refresh, period])
  useEffect(() => {
    const sync = () => { if (isOpen) load() }
    window.addEventListener('rdx-order-updated', sync)
    window.addEventListener('rdx-menu-updated', sync)
    return () => { window.removeEventListener('rdx-order-updated', sync); window.removeEventListener('rdx-menu-updated', sync) }
  }, [isOpen, period])

  const categoryLookup = useMemo(() => {
    const map = {}
    Object.entries(catalog).forEach(([category, items]) => {
      if (!Array.isArray(items)) return
      items.forEach((item) => { if (item?.id) map[item.id] = category; if (item?.name) map[`name:${item.name}`] = category })
    })
    return map
  }, [catalog])

  const now = Date.now()
  const filtered = useMemo(() => {
    if (period === 'all') return orders
    const cutoff = now - Number(period) * 86400000
    return orders.filter(o => Number(o.createdAt || 0) >= cutoff)
  }, [orders, period, now])
  const previous = useMemo(() => {
    if (period === 'all') return []
    const days = Number(period), end = now - days * 86400000, start = end - days * 86400000
    return orders.filter(o => Number(o.createdAt || 0) >= start && Number(o.createdAt || 0) < end)
  }, [orders, period, now])

  const stats = useMemo(() => {
    const revenue = filtered.reduce((s, o) => s + revenueOf(o), 0)
    const subtotal = filtered.reduce((s, o) => s + Number(o.subtotal || 0), 0)
    const discounts = filtered.reduce((s, o) => s + discountOf(o), 0)
    const customers = new Set(filtered.map(o => o.customerEmail).filter(Boolean))
    const repeat = [...customers].filter(email => filtered.filter(o => o.customerEmail === email).length > 1).length
    const itemMap = {}, categoryMap = {}, daily = {}, hour = Array(24).fill(0)
    let itemsSold = 0
    filtered.forEach(o => {
      const ts = Number(o.createdAt || 0)
      if (ts) hour[new Date(ts).getHours()]++
      const dk = dateKey(ts); daily[dk] = (daily[dk] || 0) + revenueOf(o)
      ;(o.items || []).forEach(item => {
        const q = Number(item.quantity || 0); itemsSold += q
        itemMap[item.name] = (itemMap[item.name] || 0) + q
        const cat = item.category || categoryLookup[item.id] || categoryLookup[`name:${item.name}`] || 'Other'
        categoryMap[cat] = (categoryMap[cat] || 0) + Number(item.price || 0) * q
      })
    })
    const prevRevenue = previous.reduce((s, o) => s + revenueOf(o), 0)
    return {
      revenue, subtotal, discounts, orders: filtered.length, avg: filtered.length ? revenue / filtered.length : 0,
      customers: customers.size, repeat, repeatRate: customers.size ? repeat / customers.size * 100 : 0,
      itemsSold, completed: filtered.filter(o => completed.includes(o.status)).length,
      active: filtered.filter(o => !completed.includes(o.status)).length,
      delivery: filtered.filter(o => o.orderType !== 'pickup').length,
      pickup: filtered.filter(o => o.orderType === 'pickup').length,
      coupons: filtered.filter(o => o.couponCode).length, offers: filtered.filter(o => o.offerId).length,
      online: filtered.filter(o => String(o.paymentStatus).toLowerCase() === 'online').length,
      cash: filtered.filter(o => String(o.paymentStatus).toLowerCase() === 'cash').length,
      pending: filtered.filter(o => !['online', 'cash'].includes(String(o.paymentStatus).toLowerCase())).length,
      loyaltyEarned: filtered.reduce((s, o) => s + Number(o.loyaltyPointsEarned || 0), 0),
      loyaltyRedeemed: filtered.reduce((s, o) => s + Number(o.loyaltyPointsRedeemed || 0), 0),
      loyaltyDiscount: filtered.reduce((s, o) => s + Number(o.loyaltyDiscount || 0), 0),
      growth: prevRevenue ? (revenue - prevRevenue) / prevRevenue * 100 : null,
      topItems: Object.entries(itemMap).sort((a,b) => b[1] - a[1]).slice(0, 8),
      categories: Object.entries(categoryMap).sort((a,b) => b[1] - a[1]).slice(0, 6),
      daily: Object.entries(daily).filter(([k]) => k !== 'unknown').sort(([a],[b]) => a.localeCompare(b)).slice(-14),
      peakHours: hour.map((value, h) => ({ hour: h, value })).sort((a,b) => b.value - a.value).slice(0, 5),
      statuses: Object.entries(filtered.reduce((m, o) => { const s = o.status || 'Order Placed'; m[s] = (m[s] || 0) + 1; return m }, {})),
    }
  }, [filtered, previous, categoryLookup])

  const exportCsv = () => {
    const header = ['Order ID','Date','Customer','Email','Status','Order Type','Payment','Subtotal','Coupon Discount','Offer Discount','Loyalty Discount','Total']
    const rows = filtered.map(o => [o.id,o.date || '',o.name || '',o.customerEmail || '',o.status || '',o.orderType || '',o.paymentStatus || 'pending',o.subtotal || 0,o.couponDiscount || 0,o.offerDiscount || 0,o.loyaltyDiscount || 0,revenueOf(o)])
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v ?? '').replaceAll('"','""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a'); a.href = url; a.download = `rdx-analytics-${period === 'all' ? 'all-time' : `${period}-days`}.csv`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }
  if (!isOpen) return null
  const tabs = [['overview','Overview'],['sales','Sales'],['customers','Customers'],['products','Products'],['promotions','Promotions']]
  const maxDaily = Math.max(...stats.daily.map(([,v]) => v), 1)
  const maxHour = Math.max(...stats.peakHours.map(x => x.value), 1)

  return <div className="fixed inset-0 z-[145] bg-black/85 backdrop-blur-sm overflow-y-auto"><div className="min-h-full p-4 sm:p-6 lg:p-10"><div className="max-w-7xl mx-auto bg-gray-950 border border-gray-800 rounded-3xl shadow-2xl overflow-hidden">
    <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800 sticky top-0 bg-gray-950/95 z-20"><div><p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food · Version 4</p><h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Advanced Analytics</h2><p className="text-sm text-gray-500 mt-1">Sales, customers, products, payments, promotions and loyalty performance.</p></div><div className="flex flex-wrap items-center gap-2"><select value={period} onChange={e=>setPeriod(e.target.value)} className="analytics-select"><option value="all">All time</option><option value="90">Last 90 days</option><option value="30">Last 30 days</option><option value="7">Last 7 days</option><option value="1">Today</option></select><button type="button" onClick={exportCsv} className="analytics-action"><FaDownload/> Export CSV</button><button type="button" onClick={()=>setRefresh(x=>x+1)} className="analytics-icon"><FaSyncAlt/></button><button type="button" onClick={onBack || onClose} className="analytics-icon" aria-label="Back to admin dashboard"><FaArrowLeft/></button><button type="button" onClick={onClose} className="analytics-icon" aria-label="Close analytics"><FaTimes/></button></div></header>
    <main className="p-5 sm:p-7 space-y-6">
      {error && <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">{error}</div>}
      {loading && <div className="text-xs text-gray-500">Loading analytics from MongoDB...</div>}
      <div className="analytics-tabs">{tabs.map(([v,l])=><button key={v} type="button" onClick={()=>setTab(v)} className={tab===v?'analytics-tab active':'analytics-tab'}>{l}</button>)}</div>
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"><Metric icon={<FaClipboardList/>} label="Orders" value={stats.orders}/><Metric icon={<FaRupeeSign/>} label="Revenue" value={money(stats.revenue)} trend={stats.growth}/><Metric icon={<FaChartLine/>} label="Average Order" value={money(stats.avg)}/><Metric icon={<FaUsers/>} label="Customers" value={stats.customers}/><Metric icon={<FaShoppingBag/>} label="Items Sold" value={stats.itemsSold}/><Metric icon={<FaPercent/>} label="Discount Given" value={money(stats.discounts)}/><Metric icon={<FaStar/>} label="Loyalty Redeemed" value={`${stats.loyaltyRedeemed.toLocaleString('en-IN')} pts`}/><Metric icon={<FaClock/>} label="Repeat Rate" value={`${stats.repeatRate.toFixed(1)}%`}/></section>
      {(tab==='overview'||tab==='sales')&&<section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5"><Panel title="Revenue trend" subtitle="Daily revenue in the selected period.">{stats.daily.length?<div className="h-64 flex items-end gap-2 sm:gap-3 border-b border-gray-800 px-1 pb-2 overflow-x-auto">{stats.daily.map(([day,value])=><div key={day} className="flex-1 min-w-[38px] h-full flex flex-col justify-end items-center gap-2"><span className="text-[10px] text-gray-500">{money(value)}</span><div className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-primary to-secondary" style={{height:`${Math.max(6,value/maxDaily*78)}%`}}/><span className="text-[10px] text-gray-600">{dateLabel(day)}</span></div>)}</div>:<Empty/>}</Panel><Panel title="Payment mix" subtitle="Saved payment status by order."><div className="space-y-4 mt-5"><Progress label="Online" value={stats.online} total={stats.orders}/><Progress label="Cash" value={stats.cash} total={stats.orders}/><Progress label="Pending" value={stats.pending} total={stats.orders}/></div><div className="grid grid-cols-3 gap-2 mt-5"><Mini label="Online" value={stats.online}/><Mini label="Cash" value={stats.cash}/><Mini label="Pending" value={stats.pending}/></div></Panel></section>}
      {(tab==='overview'||tab==='sales')&&<section className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Panel title="Order status" subtitle="Operational workload."><div className="grid grid-cols-2 gap-3 mt-5">{stats.statuses.length?stats.statuses.map(([l,v])=><Mini key={l} label={l} value={v}/>):<Empty/>}</div></Panel><Panel title="Peak ordering hours" subtitle="Hours with the highest order volume."><div className="space-y-3 mt-5">{stats.peakHours.length&&stats.peakHours[0].value?stats.peakHours.map(x=><div key={x.hour} className="flex items-center gap-3"><span className="w-14 text-xs text-gray-500">{String(x.hour).padStart(2,'0')}:00</span><div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{width:`${Math.max(8,x.value/maxHour*100)}%`}}/></div><span className="text-sm text-white font-semibold">{x.value}</span></div>):<Empty/>}</div></Panel></section>}
      {(tab==='overview'||tab==='customers')&&<section className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Panel title="Customer performance" subtitle="Unique and returning customers."><div className="grid grid-cols-2 gap-3 mt-5"><Mini label="Unique customers" value={stats.customers}/><Mini label="Returning" value={stats.repeat}/><Mini label="Repeat rate" value={`${stats.repeatRate.toFixed(1)}%`}/><Mini label="Orders / customer" value={stats.customers?(stats.orders/stats.customers).toFixed(1):'0.0'}/></div><div className="mt-5 rounded-xl border border-gray-800 bg-gray-950/60 p-4"><p className="text-xs text-gray-500">Revenue per customer</p><p className="text-xl font-bold text-white mt-1">{money(stats.customers?stats.revenue/stats.customers:0)}</p></div></Panel><Panel title="Loyalty performance" subtitle="Version 4 loyalty activity."><div className="grid grid-cols-2 gap-3 mt-5"><Mini label="Points earned" value={stats.loyaltyEarned.toLocaleString('en-IN')}/><Mini label="Points redeemed" value={stats.loyaltyRedeemed.toLocaleString('en-IN')}/><Mini label="Discount value" value={money(stats.loyaltyDiscount)}/><Mini label="Redemption orders" value={filtered.filter(o=>Number(o.loyaltyPointsRedeemed||0)>0).length}/></div></Panel></section>}
      {(tab==='overview'||tab==='products')&&<section className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Panel title="Top selling items" subtitle="Ranked by quantity sold."><div className="mt-5 space-y-3">{stats.topItems.length?stats.topItems.map(([n,q],i)=><Rank key={n} i={i} label={n} value={`${q} sold`}/>):<Empty/>}</div></Panel><Panel title="Category revenue" subtitle="Revenue attributed to menu categories."><div className="mt-5 space-y-3">{stats.categories.length?stats.categories.map(([n,v],i)=><Rank key={n} i={i} label={n} value={money(v)}/>):<Empty text="Category data will appear when menu catalog data is available."/>}</div></Panel></section>}
      {(tab==='overview'||tab==='promotions')&&<section className="grid grid-cols-1 xl:grid-cols-2 gap-5"><Panel title="Promotion performance" subtitle="Coupons and offers used on orders."><div className="grid grid-cols-2 gap-3 mt-5"><Mini label="Coupon orders" value={stats.coupons}/><Mini label="Offer orders" value={stats.offers}/><Mini label="Total discounts" value={money(stats.discounts)}/><Mini label="Discount rate" value={`${stats.subtotal?((stats.discounts/stats.subtotal)*100).toFixed(1):'0.0'}%`}/></div></Panel><Panel title="Fulfilment mix" subtitle="Delivery versus pickup."><div className="space-y-4 mt-5"><Progress label="Delivery" value={stats.delivery} total={stats.orders}/><Progress label="Pickup" value={stats.pickup} total={stats.orders}/></div></Panel></section>}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-secondary/10 p-5"><p className="text-xs uppercase tracking-[0.18em] text-primary font-semibold">Backend analytics</p><h3 className="text-lg font-bold text-white mt-1">Advanced reporting is connected to MongoDB.</h3><p className="text-sm text-gray-400 mt-1">Metrics use backend order and menu data. Export the selected period as CSV.</p></div>
    </main>
  </div></div><style>{`.analytics-select{background:#111827;border:1px solid #374151;border-radius:.75rem;padding:.65rem .9rem;color:#fff;outline:none}.analytics-action{display:flex;align-items:center;gap:.45rem;background:linear-gradient(90deg,#f97316,#fb923c);color:#fff;border:0;border-radius:.75rem;padding:.65rem .9rem;font-size:.8rem;font-weight:700}.analytics-icon{width:2.55rem;height:2.55rem;border-radius:999px;border:1px solid #374151;background:#111827;color:#9ca3af;display:flex;align-items:center;justify-content:center}.analytics-tabs{display:flex;gap:.5rem;overflow-x:auto;border-bottom:1px solid #1f2937;padding-bottom:.6rem}.analytics-tab{white-space:nowrap;padding:.65rem .9rem;border-radius:.7rem;color:#9ca3af;font-size:.82rem;font-weight:700}.analytics-tab.active{color:#fff;background:rgba(249,115,22,.12);border:1px solid rgba(249,115,22,.2)}`}</style></div>
}
const Panel=({title,subtitle,children})=><div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5"><h3 className="text-lg font-bold text-white">{title}</h3><p className="text-xs text-gray-500 mt-1">{subtitle}</p>{children}</div>
const Metric=({icon,label,value,trend})=><div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-wider text-gray-500">{label}</p><p className="text-2xl sm:text-3xl font-bold text-white mt-2">{value}</p>{typeof trend==='number'&&<p className={`text-xs mt-1 ${trend>=0?'text-emerald-400':'text-red-400'}`}>{trend>=0?'↑':'↓'} {Math.abs(trend).toFixed(1)}% vs previous period</p>}</div><div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">{icon}</div></div></div>
const Mini=({label,value})=><div className="rounded-xl border border-gray-800 bg-gray-950/60 p-4"><p className="text-[11px] uppercase tracking-wider text-gray-600">{label}</p><p className="text-lg font-bold text-white mt-1">{value}</p></div>
const Progress=({label,value,total})=><div><div className="flex items-center justify-between text-xs mb-2"><span className="text-gray-400">{label}</span><span className="text-white font-semibold">{value}</span></div><div className="h-2 rounded-full bg-gray-800 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary" style={{width:`${total?Math.min(100,value/total*100):0}%`}}/></div></div>
const Rank=({i,label,value})=><div className="flex items-center gap-3"><span className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold flex items-center justify-center">{i+1}</span><span className="text-sm text-gray-300 flex-1 truncate">{label}</span><span className="text-sm font-semibold text-white">{value}</span></div>
const Empty=({text='No data available for this period.'})=><div className="py-10 text-center text-sm text-gray-600">{text}</div>

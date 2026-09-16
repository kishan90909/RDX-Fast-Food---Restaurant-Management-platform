import { useEffect, useMemo, useState } from 'react'
import { FaHeart, FaHistory, FaMagic, FaShoppingCart, FaStar } from 'react-icons/fa'
import { api } from '../api'

const priceValue = (price) => {
  const match = String(price || '').match(/\d+/)
  return match ? Number(match[0]) : 0
}

const PersonalizedMenu = ({
  currentUser,
  orders = [],
  favorites = [],
  inventory = {},
  onAddToCart = () => {},
  onToggleFavorite = () => {},
}) => {
  const [backendTabs, setBackendTabs] = useState(null)
  const [activeTab, setActiveTab] = useState('forYou')

  useEffect(() => {
    let cancelled = false
    if (!currentUser?.email || currentUser.role === 'admin') {
      setBackendTabs(null)
      return () => { cancelled = true }
    }
    api.personalizedMenu.get().then((data) => {
      if (!cancelled && data?.tabs) setBackendTabs(data.tabs)
    }).catch(() => {
      if (!cancelled) setBackendTabs(null)
    })
    return () => { cancelled = true }
  }, [currentUser?.email, currentUser?.role])

  const personalized = Boolean(currentUser?.email)

  const tabs = [
    { id: 'forYou', label: 'For You', icon: <FaMagic /> },
    { id: 'favorites', label: 'Favorites', icon: <FaHeart /> },
    { id: 'recent', label: 'Recently Ordered', icon: <FaHistory /> },
    { id: 'discover', label: 'Try Something New', icon: <FaStar /> },
  ]

  const visibleItems = useMemo(() => {
    if (!backendTabs) return []
    const key = activeTab === 'favorites' ? 'favorites' : activeTab === 'recent' ? 'recent' : activeTab === 'discover' ? 'discover' : 'forYou'
    return (backendTabs[key] || []).slice(0, 8)
  }, [activeTab, backendTabs])

  return (
    <section id="personalized-menu" className="py-16 bg-gray-950 border-y border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
            <FaMagic aria-hidden="true" /> Personalized Menu
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            {personalized ? 'Your Menu, Your Way' : 'Explore Your Menu'}
          </h2>
          <p className="text-gray-400 mt-2">
            {personalized
              ? 'Your menu is organized around your favorites, order history, and food preferences.'
              : 'Sign in to personalize this menu around your favorites and ordering history.'}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${activeTab === tab.id ? 'bg-primary text-white border-primary' : 'border-gray-700 text-gray-400 hover:text-white hover:border-primary/50'}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-gray-400">
            {activeTab === 'favorites' ? 'No favorite items yet. Tap the heart on any menu item to add one.' : 'No items are available in this personalized list yet.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {visibleItems.map((item) => {
              const stock = inventory[item.id]
              return (
                <article key={item.id} className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-5 hover:border-primary/40 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-primary font-bold">{item.category}</span>
                      <h3 className="text-lg font-semibold text-white mt-2">{item.name}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(item.id)}
                      aria-label={`${item.favorite ? 'Remove' : 'Add'} ${item.name} ${item.favorite ? 'from' : 'to'} favorites`}
                      className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center ${item.favorite ? 'border-primary text-primary bg-primary/10' : 'border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50'}`}
                    >
                      <FaHeart />
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-3">
                    {item.purchaseCount > 0 ? `You ordered this ${item.purchaseCount} time${item.purchaseCount === 1 ? '' : 's'}.` : item.bestseller ? 'Popular with RDX customers.' : item.special ? "Chef's recommendation." : 'A new pick for you.'}
                  </p>

                  <div className="flex items-center justify-between gap-3 mt-5">
                    <div>
                      <p className="text-xl font-bold text-primary">₹{priceValue(item.price)}</p>
                      {item.bestseller && <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1"><FaStar /> Bestseller</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => onAddToCart({ id: item.id, name: item.name, category: item.category, price: priceValue(item.price) })}
                      disabled={stock && Number(stock.stock || 0) <= 0}
                      className="bg-gradient-to-r from-primary to-secondary px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <FaShoppingCart /> Add
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default PersonalizedMenu

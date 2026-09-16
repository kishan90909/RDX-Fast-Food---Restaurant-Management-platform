import { useEffect, useState } from 'react'
import { FaHeart, FaRobot, FaShoppingCart, FaStar } from 'react-icons/fa'
import { api } from '../api'

const lowestPrice = (price) => {
  const matches = String(price || '').match(/\d+/g)
  return matches ? Number(matches[0]) : 0
}

const AIRecommendations = ({
  currentUser,
  orders = [],
  favorites = [],
  cartItems = [],
  inventory = {},
  onAddToCart = () => {},
  onToggleFavorite = () => {},
  onOpenAuth = () => {},
}) => {


  const [backendRecommendations, setBackendRecommendations] = useState([])
  const [backendPersonalized, setBackendPersonalized] = useState(false)

  useEffect(() => {
    let active = true
    if (!currentUser?.email || currentUser.role === 'admin') {
      setBackendRecommendations([])
      setBackendPersonalized(false)
      return () => { active = false }
    }
    api.recommendations.get()
      .then((result) => {
        if (!active) return
        setBackendRecommendations(Array.isArray(result?.recommendations) ? result.recommendations : [])
        setBackendPersonalized(Boolean(result?.personalized))
      })
      .catch(() => {
        if (active) {
          setBackendRecommendations([])
          setBackendPersonalized(false)
        }
      })
    return () => { active = false }
  }, [currentUser?.email, currentUser?.role, orders.length, favorites.length, cartItems.length, inventory])


  const recommendations = backendRecommendations
  const visibleRecommendations = recommendations.filter((item) => !cartItems.some((cartItem) => cartItem.id === (item.id || item.itemId)))
  const personalized = currentUser?.email ? backendPersonalized : false


  return (
    <section id="ai-recommendations" className="py-16 bg-gray-950 border-y border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-4">
              <FaRobot aria-hidden="true" /> AI Recommendations
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              {personalized ? 'Picked for You' : 'Smart Picks for You'}
            </h2>
            <p className="text-gray-400 mt-2">
              {personalized
                ? 'Recommendations are based on your orders, favorites, and menu preferences.'
                : 'Sign in to unlock recommendations based on your ordering preferences.'}
            </p>
          </div>
          {!currentUser && (
            <button type="button" onClick={onOpenAuth} className="self-start sm:self-auto border border-primary/50 text-primary px-5 py-2.5 rounded-full font-semibold hover:bg-primary/10 transition-colors">
              Login for personalized picks
            </button>
          )}
        </div>

        {visibleRecommendations.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-8 text-center text-gray-400">
            No recommendations are available right now. Try adding an item to your favorites or ordering from the menu.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visibleRecommendations.map((item) => {
              const isFavorite = favorites.includes(item.id)
              const stock = inventory[item.id || item.itemId]
              const price = lowestPrice(item.price)
              return (
                <article key={item.id} className="relative rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-gray-950 p-5 overflow-hidden hover:border-primary/40 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 blur-3xl pointer-events-none" />
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] uppercase tracking-widest text-primary font-bold">{item.category}</span>
                      <h3 className="text-xl font-semibold text-white mt-2">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-2"><FaRobot className="text-primary" aria-hidden="true" /> {item.reason}</p>
                    </div>
                    <button type="button" onClick={() => onToggleFavorite(item.id)} aria-label={`${isFavorite ? 'Remove' : 'Add'} ${item.name} ${isFavorite ? 'from' : 'to'} favorites`} className={`w-9 h-9 shrink-0 rounded-full border flex items-center justify-center transition-colors ${isFavorite ? 'border-primary text-primary bg-primary/10' : 'border-gray-700 text-gray-500 hover:text-primary hover:border-primary/50'}`}>
                      <FaHeart aria-hidden="true" />
                    </button>
                  </div>
                  <div className="relative flex items-center justify-between gap-4 mt-5">
                    <div>
                      <p className="text-2xl font-bold text-primary">₹{price}</p>
                      {item.bestseller && <span className="text-xs text-yellow-400 flex items-center gap-1 mt-1"><FaStar /> Bestseller</span>}
                    </div>
                    {stock && Number(stock.stock || 0) <= 5 && Number(stock.stock || 0) > 0 && <span className="text-xs text-yellow-400">Only {stock.stock} left</span>}
                    <button type="button" onClick={() => onAddToCart({ id: item.id || item.itemId, name: item.name, category: item.category, price })} disabled={stock && Number(stock.stock || 0) <= 0} className="bg-gradient-to-r from-primary to-secondary px-4 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-40 disabled:cursor-not-allowed">
                      <FaShoppingCart aria-hidden="true" /> Add
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

export default AIRecommendations

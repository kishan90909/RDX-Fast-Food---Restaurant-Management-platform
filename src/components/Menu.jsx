import { useEffect, useMemo, useState } from 'react'
import { FaHeart, FaSearch, FaStar } from 'react-icons/fa'
import { api } from '../api.js'

const Menu = ({ favorites = [], onToggleFavorite = () => {}, onAddToCart = () => {}, inventory = {} }) => {
  const [menuData, setMenuData] = useState({})

  useEffect(() => {
    let cancelled = false

    const loadMenu = async () => {
      try {
        const response = await api.menu()
        if (cancelled) return
        const catalog = {}
        ;(response.items || []).forEach((item) => {
          const category = item.category || 'Other'
          if (!catalog[category]) catalog[category] = []
          catalog[category].push({
            id: item.itemId,
            itemId: item.itemId,
            name: item.name,
            price: item.priceLabel || `₹${item.price}`,
            bestseller: Boolean(item.bestseller),
            special: Boolean(item.special),
            available: item.available !== false,
            dietType: item.dietType,
          })
        })
        if (Object.keys(catalog).length) {
          setMenuData(catalog)
          setActiveCategory((current) => catalog[current] ? current : Object.keys(catalog)[0])
        }
      } catch {
        setMenuData({})
      }
    }

    loadMenu()

    return () => { cancelled = true }
  }, [])

  const [activeCategory, setActiveCategory] = useState("Chef's Special")
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return []

    return Object.entries(menuData).flatMap(([category, items]) =>
      items
        .filter((item) => item.available !== false)
        .filter((item) =>
          item.name.toLowerCase().includes(query) ||
          category.toLowerCase().includes(query)
        )
        .map((item) => ({ ...item, category }))
    )
  }, [menuData, searchQuery])

  const baseItems = searchQuery.trim()
    ? searchResults
    : (menuData[activeCategory] || []).filter((item) => item.available !== false).map((item) => ({ ...item, category: activeCategory }))

  const getDietType = (item) => {
    const name = item.name.toLowerCase()
    const category = item.category.toLowerCase()

    const nonVegKeywords = [
      'chicken',
      'egg',
      'non-veg',
    ]

    return nonVegKeywords.some((keyword) => name.includes(keyword) || category.includes(keyword))
      ? 'Non-Veg'
      : 'Veg'
  }

  const getLowestPrice = (price) => {
    const matches = price.match(/\d+/g)
    return matches ? Number(matches[0]) : Infinity
  }

  const itemKey = (item) => item.id || item.itemId || `${item.category}::${item.name}`

  const getStock = (item) => {
    const key = itemKey(item)
    const record = inventory[key] || inventory[`${item.category}::${item.name}`]
    return record ? Number(record.stock || 0) : null
  }

  const visibleItems = baseItems.filter((item) => {
    switch (activeFilter) {
      case 'Veg':
        return getDietType(item) === 'Veg'
      case 'Non-Veg':
        return getDietType(item) === 'Non-Veg'
      case 'Bestseller':
        return item.bestseller
      case "Chef's Special":
        return item.special
      case 'Under ₹100':
        return getLowestPrice(item.price) < 100
      case 'Favorites':
        return favorites.includes(itemKey(item))
      default:
        return true
    }
  })

  const filterOptions = ['All', 'Veg', 'Non-Veg', 'Bestseller', "Chef's Special", 'Under ₹100', 'Favorites']

  return (
    <section id="menu" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Our <span className="text-gradient">Menu</span>
          </h2>
          <p className="text-gray-400 text-lg">Explore our delicious offerings</p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search menu..."
              aria-label="Search menu items"
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors duration-300"
            />
          </div>
        </div>

        <div className="mb-10">
          <div className="text-center mb-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Quick Filters</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2" aria-label="Quick menu filters">
            {filterOptions.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveFilter(filter)}
                className={`px-5 py-2 rounded-full text-sm font-semibold border transition-all duration-300 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-primary to-secondary border-transparent text-white'
                    : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
                aria-pressed={activeFilter === filter}
              >
                {filter === 'Favorites' ? '❤️ Favorites' : filter === 'Bestseller' ? '⭐ Bestseller' : filter === "Chef's Special" ? "👨‍🍳 Chef's Special" : filter === 'Veg' ? '🟢 Veg' : filter === 'Non-Veg' ? '🔴 Non-Veg' : filter === 'Under ₹100' ? '💰 Under ₹100' : 'All'}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-12">
          <div className="text-center mb-4">
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Categories</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3" aria-label="Menu categories">
            {Object.keys(menuData).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => {
                  setActiveCategory(category)
                  setSearchQuery('')
                }}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-primary to-secondary'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {(searchQuery.trim() || activeFilter !== 'All') && (
          <div className="text-center mb-8">
            <p className="text-gray-400">
              {visibleItems.length > 0
                ? <>Showing <span className="text-white font-semibold">{visibleItems.length}</span> result{visibleItems.length !== 1 ? 's' : ''}{searchQuery.trim() && <> for <span className="text-primary font-semibold">"{searchQuery.trim()}"</span></>}{activeFilter !== 'All' && <> in <span className="text-primary font-semibold">{activeFilter}</span></>}</>
                : <>No menu items found{searchQuery.trim() && <> for <span className="text-primary font-semibold">"{searchQuery.trim()}"</span></>}{activeFilter !== 'All' && <> in <span className="text-primary font-semibold">{activeFilter}</span></>}</>}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleItems.map((item, index) => (
            <div
              key={`${item.category}-${item.name}-${index}`}
              className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl hover:scale-105 transition-transform duration-300 border border-gray-700 relative overflow-hidden group"
            >
              <button
                type="button"
                onClick={() => onToggleFavorite(itemKey(item))}
                aria-label={`${favorites.includes(itemKey(item)) ? 'Remove' : 'Add'} ${item.name} ${favorites.includes(itemKey(item)) ? 'from' : 'to'} favorites`}
                aria-pressed={favorites.includes(itemKey(item))}
                className={`absolute bottom-4 right-4 z-10 w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-300 ${
                  favorites.includes(itemKey(item))
                    ? 'bg-primary/20 border-primary text-primary'
                    : 'bg-black/20 border-white/10 text-gray-400 hover:text-primary hover:border-primary/50'
                }`}
              >
                <FaHeart aria-hidden="true" />
              </button>
              {item.bestseller && (
                <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaStar /> Bestseller
                </div>
              )}
              {item.special && (
                <div className="absolute top-3 right-3 bg-gradient-to-r from-primary to-secondary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FaStar /> Chef's Special
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-secondary/0 group-hover:from-primary/10 group-hover:to-secondary/10 transition-all duration-300"></div>
              <div className="relative pr-12">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                {searchQuery.trim() && (
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">{item.category}</p>
                )}
                <p className="text-2xl font-bold text-primary">{item.price}</p>
                {getStock(item) !== null && getStock(item) <= 0 ? (
                  <button type="button" disabled className="mt-5 bg-gray-800 text-gray-500 px-5 py-2 rounded-full font-semibold text-sm cursor-not-allowed">Out of Stock</button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddToCart({
                      id: `${item.category}::${item.name}`,
                      name: item.name,
                      category: item.category,
                      price: getLowestPrice(item.price),
                    })}
                    className="mt-5 bg-gradient-to-r from-primary to-secondary px-5 py-2 rounded-full font-semibold text-sm hover:scale-105 transition-transform duration-300"
                  >
                    Add to Cart
                  </button>
                )}
                {getStock(item) !== null && getStock(item) <= 5 && getStock(item) > 0 && (
                  <p className="mt-2 text-xs text-yellow-400">Only {getStock(item)} left</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="#contact" className="inline-block bg-gradient-to-r from-primary to-secondary px-8 py-4 rounded-full font-semibold text-lg hover:scale-105 transition-transform duration-300">
            Order Your Favorites Now
          </a>
        </div>
      </div>
    </section>
  )
}

export default Menu

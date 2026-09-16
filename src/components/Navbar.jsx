import { useState, useEffect } from 'react'
import { FaBars, FaTimes, FaHeart, FaShoppingCart, FaUserCircle, FaBell, FaStar } from 'react-icons/fa'

const Navbar = ({ favoriteCount = 0, cartCount = 0, notificationCount = 0, currentUser = null, onOpenAuth = () => {}, onLogout = () => {}, onOpenCart = () => {}, onOpenOrderHistory = () => {}, onOpenNotifications = () => {}, onOpenAdminDashboard = () => {}, loyaltyPoints = 0, onOpenLoyalty = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Menu', href: '#menu' },
    { name: 'AI Picks', href: '#ai-recommendations' },
    { name: 'Personalized', href: '#personalized-menu' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ]

  return (
    <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-11/12 max-w-6xl">
      <div className={`transition-all duration-300 ${scrolled ? 'bg-white/10' : 'bg-white/5'} backdrop-blur-md rounded-full border border-white/20 shadow-2xl px-6 py-3`}>
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold flex items-center gap-2">
            <img src="/rdxlogo.jpg" alt="RDX Logo" className="h-8 w-8 rounded-full" />
            <span className="text-primary">RDX</span> <span className="text-white">Fast Food</span>
          </div>

          <div className="hidden md:flex space-x-8 text-base">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="text-gray-300 hover:text-primary transition-colors duration-300">
                {link.name}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <a
              href="#menu"
              aria-label={`View favorites${favoriteCount ? ` (${favoriteCount})` : ''}`}
              className="relative w-10 h-10 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300"
            >
              <FaHeart aria-hidden="true" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </a>
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open cart${cartCount ? ` (${cartCount} items)` : ''}`}
              className="relative w-10 h-10 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300"
            >
              <FaShoppingCart aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            {currentUser && (
              <button type="button" onClick={onOpenNotifications} aria-label={`Open notifications${notificationCount ? ` (${notificationCount} unread)` : ''}`} className="relative w-9 h-9 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                <FaBell aria-hidden="true" />
                {notificationCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center">{notificationCount > 99 ? '99+' : notificationCount}</span>}
              </button>
            )}
            {currentUser ? (
              <div className="relative group">
                <button type="button" aria-label="Open account menu" className="w-10 h-10 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                  <FaUserCircle aria-hidden="true" />
                </button>
                <div className="absolute right-0 top-11 hidden group-hover:block w-48 rounded-2xl bg-gray-950/95 backdrop-blur-md border border-gray-800 shadow-2xl p-3">
                  <p className="text-white font-semibold text-sm truncate px-2">{currentUser.name}</p>
                  <p className="text-gray-500 text-xs truncate px-2 mt-1">{currentUser.email}</p>
                  <button type="button" onClick={onOpenOrderHistory} className="w-full mt-3 text-left px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Order History</button>
                  <button type="button" onClick={onOpenLoyalty} className="w-full mt-1 text-left px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-primary hover:bg-white/5 transition-colors flex items-center justify-between"><span>⭐ Loyalty Points</span><span className="text-xs text-primary">{loyaltyPoints}</span></button>
                  {currentUser.role === 'admin' && <button type="button" onClick={onOpenAdminDashboard} className="w-full mt-1 text-left px-2 py-2 rounded-lg text-sm text-primary hover:text-white hover:bg-white/5 transition-colors">Admin Dashboard</button>}
                  <button type="button" onClick={onLogout} className="w-full mt-1 text-left px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Logout</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={onOpenAuth} aria-label="Login or sign up" className="w-10 h-10 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                <FaUserCircle aria-hidden="true" />
              </button>
            )}
            <a href="#contact" className="bg-gradient-to-r from-primary to-secondary px-6 py-2 rounded-full font-semibold text-base hover:scale-105 transition-transform duration-300">
              Order Now
            </a>
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <a
              href="#menu"
              aria-label={`View favorites${favoriteCount ? ` (${favoriteCount})` : ''}`}
              className="relative w-9 h-9 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300"
            >
              <FaHeart aria-hidden="true" />
              {favoriteCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {favoriteCount > 99 ? '99+' : favoriteCount}
                </span>
              )}
            </a>
            <button
              type="button"
              onClick={onOpenCart}
              aria-label={`Open cart${cartCount ? ` (${cartCount} items)` : ''}`}
              className="relative w-9 h-9 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300"
            >
              <FaShoppingCart aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
            {currentUser && (
              <button type="button" onClick={onOpenNotifications} aria-label={`Open notifications${notificationCount ? ` (${notificationCount} unread)` : ''}`} className="relative w-10 h-10 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                <FaBell aria-hidden="true" />
                {notificationCount > 0 && <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold flex items-center justify-center">{notificationCount > 99 ? '99+' : notificationCount}</span>}
              </button>
            )}
            {currentUser ? (
              <div className="relative group">
                <button type="button" aria-label="Open account menu" className="w-9 h-9 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                  <FaUserCircle aria-hidden="true" />
                </button>
                <div className="absolute right-0 top-10 hidden group-hover:block w-44 rounded-2xl bg-gray-950/95 backdrop-blur-md border border-gray-800 shadow-2xl p-3">
                  <p className="text-white font-semibold text-sm truncate px-2">{currentUser.name}</p>
                  <button type="button" onClick={onOpenOrderHistory} className="w-full mt-3 text-left px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Order History</button>
                  {currentUser.role === 'admin' && <button type="button" onClick={onOpenAdminDashboard} className="w-full mt-1 text-left px-2 py-2 rounded-lg text-sm text-primary hover:text-white hover:bg-white/5 transition-colors">Admin Dashboard</button>}
                  <button type="button" onClick={onLogout} className="w-full mt-1 text-left px-2 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Logout</button>
                </div>
              </div>
            ) : (
              <button type="button" onClick={onOpenAuth} aria-label="Login or sign up" className="w-9 h-9 rounded-full bg-transparent border border-transparent flex items-center justify-center text-white hover:text-primary transition-colors duration-300">
                <FaUserCircle aria-hidden="true" />
              </button>
            )}
            <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={isOpen} className="text-xl text-white">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl">
          <div className="px-4 pt-2 pb-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} onClick={() => setIsOpen(false)} className="block text-gray-300 hover:text-primary transition-colors py-2">
                {link.name}
              </a>
            ))}
            {currentUser ? (
              <>
                <button type="button" onClick={() => { setIsOpen(false); onOpenOrderHistory() }} className="w-full text-left text-gray-300 hover:text-primary transition-colors py-2">
                  Order History
                </button>
                <button type="button" onClick={() => { setIsOpen(false); onOpenLoyalty() }} className="w-full text-left text-gray-300 hover:text-primary transition-colors py-2 flex items-center justify-between"><span>⭐ Loyalty Points</span><span className="text-xs text-primary">{loyaltyPoints}</span></button>
                {currentUser.role === 'admin' && <button type="button" onClick={() => { setIsOpen(false); onOpenAdminDashboard() }} className="w-full text-left text-primary hover:text-white transition-colors py-2">Admin Dashboard</button>}
                <button type="button" onClick={() => { setIsOpen(false); onOpenNotifications() }} className="w-full text-left text-gray-300 hover:text-primary transition-colors py-2 flex items-center justify-between">
                  <span>Notifications</span>
                  {notificationCount > 0 && <span className="text-xs text-primary">{notificationCount} new</span>}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => { setIsOpen(false); onOpenAuth() }} className="w-full text-left text-gray-300 hover:text-primary transition-colors py-2">
                Login / Sign Up
              </button>
            )}
            <a href="#contact" onClick={() => setIsOpen(false)} className="block bg-gradient-to-r from-primary to-secondary px-6 py-2 rounded-full font-semibold text-center">
              Order Now
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navbar

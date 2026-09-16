import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Menu from './components/Menu'
import Gallery from './components/Gallery'
import Contact from './components/Contact'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import Cart from './components/Cart'
import Checkout from './components/Checkout'
import AuthModal from './components/AuthModal'
import OrderHistory from './components/OrderHistory'
import ReviewModal from './components/ReviewModal'
import OrderTracking from './components/OrderTracking'
import NotificationPanel from './components/NotificationPanel'
import AdminDashboard from './components/AdminDashboard'
import MenuManagement from './components/MenuManagement'
import OrderManagement from './components/OrderManagement'
import KitchenDashboard from './components/KitchenDashboard'
import InventoryManagement from './components/InventoryManagement'
import Analytics from './components/Analytics'
import Invoice from './components/Invoice'
import LoyaltyPoints from './components/LoyaltyPoints'
import AIRecommendations from './components/AIRecommendations'
import PersonalizedMenu from './components/PersonalizedMenu'
import { api, getCustomerKey } from './api'

const dedupeOrders = (orders) => {
  if (!Array.isArray(orders)) return []
  const seen = new Set()
  return orders.filter((order) => {
    if (!order?.id || seen.has(order.id)) return false
    seen.add(order.id)
    return true
  })
}

function App() {
  const [favorites, setFavorites] = useState([])
  const [cartItems, setCartItems] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewOrder, setReviewOrder] = useState(null)
  const [isReviewOpen, setIsReviewOpen] = useState(false)
  const [trackingOrder, setTrackingOrder] = useState(null)
  const [isTrackingOpen, setIsTrackingOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false)
  const [isMenuManagementOpen, setIsMenuManagementOpen] = useState(false)
  const [isOrderManagementOpen, setIsOrderManagementOpen] = useState(false)
  const [isKitchenDashboardOpen, setIsKitchenDashboardOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [invoiceOrder, setInvoiceOrder] = useState(null)
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false)
  const [inventory, setInventory] = useState({})
  const [loyalty, setLoyalty] = useState({ points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] })
  const [isLoyaltyOpen, setIsLoyaltyOpen] = useState(false)
  const placingOrderRef = useRef(false)
  const backendHydratedRef = useRef(false)
  const backendSyncTimerRef = useRef(null)

  const loadLoyalty = (email, role = 'customer') => {
    if (!email || role === 'admin') {
      setLoyalty({ points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] })
      return
    }
    api.loyalty.get().then((result) => {
      setLoyalty(result?.loyalty || { points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] })
    }).catch(() => setLoyalty({ points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] }))
  }

  useEffect(() => {
    let cancelled = false
    const hydrateSession = async () => {
      try {
        const { user } = await api.auth.me()
        if (cancelled) return
        setCurrentUser(user)
        loadLoyalty(user.email, user.role)
      } catch {
        if (!cancelled) {
          setCurrentUser(null)
          setOrders([])
          setNotifications([])
          setCartItems([])
          setFavorites([])
        }
      }
    }
    hydrateSession()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!currentUser?.email || !['admin', 'customer'].includes(currentUser.role)) {
      setInventory({})
      return () => { cancelled = true }
    }
    const loadInventory = async () => {
      try {
        const response = await api.inventory.list()
        if (cancelled) return
        const next = {}
        ;(response.items || []).forEach((item) => {
          next[item.itemId] = { ...item, id: item.itemId }
        })
        setInventory(next)
      } catch {
        if (!cancelled) setInventory({})
      }
    }
    loadInventory()
    const timer = window.setInterval(loadInventory, 10000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [currentUser?.email, currentUser?.role])

  useEffect(() => {
    const customerKey = getCustomerKey(currentUser)
    let cancelled = false
    if (!currentUser?.email || currentUser.role === 'admin' || !customerKey) {
      setCartItems([])
      setFavorites([])
      setOrders([])
      backendHydratedRef.current = true
      return () => { cancelled = true }
    }
    backendHydratedRef.current = false
    const hydrateFromBackend = async () => {
      try {
        const [favoriteResult, cartResult, orderResult] = await Promise.all([
          api.favorites.get(customerKey), api.cart.get(customerKey), api.orders.list(customerKey)
        ])
        if (cancelled) return
        setFavorites(Array.isArray(favoriteResult.favorites) ? favoriteResult.favorites : [])
        const serverCart = Array.isArray(cartResult.cart?.items) ? cartResult.cart.items : []
        setCartItems(serverCart.map(item => ({ id: item.itemId, name: item.name, price: item.price, quantity: item.quantity })))
        const serverOrders = Array.isArray(orderResult.orders) ? orderResult.orders : []
        setOrders(serverOrders.map(order => ({ ...order, id: order.orderId, customerEmail: order.customerEmail || currentUser.email })).slice(0, 50))
        backendHydratedRef.current = true
      } catch {
        if (!cancelled) { setFavorites([]); setCartItems([]); setOrders([]) }
        backendHydratedRef.current = true
      }
    }
    hydrateFromBackend()
    return () => { cancelled = true }
  }, [currentUser?.email, currentUser?.role])

  useEffect(() => {
    if (!currentUser?.email || currentUser.role === 'admin') { setReviews([]); return undefined }
    api.reviews.list().then(result => setReviews(Array.isArray(result.reviews) ? result.reviews.map(item => ({ ...item, id: item._id || item.id })) : [])).catch(() => setReviews([]))
    return undefined
  }, [currentUser?.email, currentUser?.role])

  useEffect(() => {
    if (!currentUser?.email || currentUser.role === 'admin') { setNotifications([]); return undefined }
    let cancelled = false
    const loadNotifications = async () => {
      try {
        const result = await api.notifications.list()
        if (!cancelled) setNotifications(Array.isArray(result.notifications) ? result.notifications.map(item => ({ ...item, id: item._id || item.id })) : [])
      } catch {
        if (!cancelled) setNotifications([])
      }
    }
    loadNotifications()
    const timer = window.setInterval(loadNotifications, 10000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [currentUser?.email, currentUser?.role])

  useEffect(() => {
    const customerKey = getCustomerKey(currentUser)
    if (currentUser?.role !== 'customer' || !customerKey || !backendHydratedRef.current) return
    clearTimeout(backendSyncTimerRef.current)
    backendSyncTimerRef.current = setTimeout(() => {
      api.cart.replace(customerKey, cartItems.map(item => ({ itemId: item.id, quantity: item.quantity }))).catch(() => {})
    }, 150)
    return () => clearTimeout(backendSyncTimerRef.current)
  }, [cartItems, currentUser?.email])

  const toggleFavorite = (favoriteKey) => {
    if (currentUser?.role !== 'customer') return
    const customerKey = getCustomerKey(currentUser)
    const willRemove = favorites.includes(favoriteKey)
    setFavorites((current) => willRemove
      ? current.filter((key) => key !== favoriteKey)
      : [...current, favoriteKey]
    )
    if (customerKey && backendHydratedRef.current) {
      const sync = willRemove ? api.favorites.remove(customerKey, favoriteKey) : api.favorites.add(customerKey, favoriteKey)
      sync.catch(() => {})
    }
  }

  const addToCart = (item) => {
    setCartItems((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id)

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }

      return [...current, { ...item, quantity: 1 }]
    })

    setIsCartOpen(true)
  }

  const increaseQuantity = (id) => {
    setCartItems((current) => {
      return current.map((item) => item.id === id ? { ...item, quantity: item.quantity + 1 } : item)
    })
  }

  const decreaseQuantity = (id) => {
    setCartItems((current) => {
      return current.map((item) => item.id === id ? { ...item, quantity: item.quantity - 1 } : item).filter(item => item.quantity > 0)
    })
  }

  const removeFromCart = (id) => {
    setCartItems((current) => {
      return current.filter((item) => item.id !== id)
    })
  }

  const clearCart = () => {
    setCartItems([])
    const customerKey = getCustomerKey(currentUser)
    if (currentUser?.role === 'customer' && customerKey && backendHydratedRef.current) api.cart.clear(customerKey).catch(() => {})
  }

  const openCheckout = () => {
    if (cartItems.length === 0) return
    setIsCartOpen(false)
    setIsCheckoutOpen(true)
  }

  const closeCheckout = () => setIsCheckoutOpen(false)

  // A successful checkout keeps the submission lock until the checkout is opened again.
  // This prevents double-clicks and React StrictMode from ever creating a second order.
  useEffect(() => {
    if (isCheckoutOpen) placingOrderRef.current = false
  }, [isCheckoutOpen])

  const handlePlaceOrder = async (form, coupon = null, offer = null, loyaltyRedemption = null) => {
    if (placingOrderRef.current || !currentUser?.email || cartItems.length === 0) return
    placingOrderRef.current = true
    try {
      const customerKey = getCustomerKey(currentUser)
      const result = await api.orders.create({
        customerKey,
        customerEmail: currentUser.email,
        name: form.name || currentUser.name || 'Customer',
        phone: form.phone || currentUser.phone || '',
        items: cartItems.map(({ id, quantity }) => ({ itemId: id, quantity })),
        orderType: form.orderType,
        address: form.orderType === 'delivery' ? form.address : '',
        landmark: form.orderType === 'delivery' ? form.landmark : '',
        pincode: form.orderType === 'delivery' ? form.pincode : '',
        paymentStatus: form.paymentStatus || 'pending',
        couponCode: coupon?.code || '',
        offerId: offer?.id || '',
        offerTitle: offer?.title || '',
        loyaltyPointsRedeemed: Number(loyaltyRedemption?.points || 0),
        loyaltyDiscount: Number(loyaltyRedemption?.discount || 0),
        source: 'website',
      })
      const savedOrder = { ...result.order, id: result.order.orderId, customerEmail: result.order.customerEmail || currentUser.email }
      setOrders(current => [savedOrder, ...current.filter(item => item.id !== savedOrder.id)].slice(0, 50))
      if (result.loyalty) setLoyalty(result.loyalty)
      setCartItems([])
      setIsCartOpen(false)
      setIsCheckoutOpen(false)
      setIsOrderHistoryOpen(true)
    } catch (error) {
      window.alert(error.message || 'Unable to place order. Please try again.')
    } finally {
      placingOrderRef.current = false
    }
  }

  const addNotification = (notification) => {
    if (!notification) return
    setNotifications((current) => [notification, ...current.filter(item => item.id !== notification.id)].slice(0, 100))
  }

  const openNotifications = async () => {
    if (!currentUser?.email) {
      setIsAuthOpen(true)
      return
    }
    if (currentUser.role !== 'admin') {
      try {
        const result = await api.notifications.list()
        const serverNotifications = Array.isArray(result.notifications)
          ? result.notifications.map((item) => ({ ...item, id: item._id || item.id }))
          : []
        setNotifications(serverNotifications)
      } catch {
        // Backend notifications are the source of truth.
      }
    }
    setIsNotificationsOpen(true)
  }

  const markNotificationRead = async (notificationId) => {
    if (!currentUser?.email || !notificationId) return
    setNotifications(current => current.map(item => item.id === notificationId ? { ...item, read: true } : item))
    if (currentUser.role !== 'admin') await api.notifications.markRead(notificationId).catch(() => {})
  }

  const markAllNotificationsRead = async () => {
    if (!currentUser?.email || currentUser.role === 'admin') return
    setNotifications(current => current.map(item => ({ ...item, read: true })))
    await api.notifications.markAllRead().catch(() => {})
  }

  const clearNotifications = async () => {
    if (!currentUser?.email || currentUser.role === 'admin') return
    setNotifications([])
    await api.notifications.clear().catch(() => {})
  }

  const handleAuthenticated = async (user) => {
    setCurrentUser(user)
    loadLoyalty(user.email, user.role)
    setIsAuthOpen(false)
    if (user.role === 'customer') {
      const customerKey = getCustomerKey(user)
      try {
        const [favoritesResult, cartResult, ordersResult, notificationsResult] = await Promise.all([
          api.favorites.get(customerKey), api.cart.get(customerKey), api.orders.list(customerKey), api.notifications.list()
        ])
        setFavorites(Array.isArray(favoritesResult.favorites) ? favoritesResult.favorites : [])
        const items = Array.isArray(cartResult.cart?.items) ? cartResult.cart.items : []
        setCartItems(items.map(item => ({ id: item.itemId, name: item.name, price: item.price, quantity: item.quantity })))
        setOrders((ordersResult.orders || []).map(order => ({ ...order, id: order.orderId, customerEmail: order.customerEmail || user.email })).slice(0, 50))
        setNotifications((notificationsResult.notifications || []).map(item => ({ ...item, id: item._id || item.id })))
      } catch {
        setFavorites([]); setCartItems([]); setOrders([]); setNotifications([])
      }
    }
  }

  const openLoyalty = () => {
    if (currentUser?.role === 'admin') return
    if (!currentUser?.email) {
      setIsAuthOpen(true)
      return
    }
    loadLoyalty(currentUser.email)
    setIsLoyaltyOpen(true)
  }

  const openOrderHistory = async () => {
    if (currentUser?.role === 'admin') return
    if (!currentUser?.email) { setIsAuthOpen(true); return }
    try {
      const result = await api.orders.list(getCustomerKey(currentUser))
      const serverOrders = Array.isArray(result.orders) ? result.orders.map(order => ({ ...order, id: order.orderId, customerEmail: order.customerEmail || currentUser.email })) : []
      setOrders(dedupeOrders(serverOrders).slice(0, 50))
      setIsOrderHistoryOpen(true)
    } catch (error) {
      window.alert(error.message || 'Unable to load order history.')
    }
  }

  const openReview = (order) => {
    if (!currentUser?.email) return
    setReviewOrder(order)
    setIsOrderHistoryOpen(false)
    setIsReviewOpen(true)
  }

  const closeReview = () => {
    setIsReviewOpen(false)
    setReviewOrder(null)
  }

  const handleSubmitReview = async ({ rating, comment }) => {
    if (!currentUser?.email || !reviewOrder) return
    try {
      const result = await api.reviews.save(reviewOrder.id, { rating, comment })
      const review = { ...result.review, id: result.review._id || result.review.id, orderId: result.review.orderId, customerEmail: currentUser.email }
      setReviews(current => [review, ...current.filter(item => item.orderId !== review.orderId)])
      closeReview()
      setIsOrderHistoryOpen(true)
    } catch (error) {
      window.alert(error.message || 'Unable to save review.')
    }
  }

  const openTracking = (order) => {
    setIsOrderHistoryOpen(false)
    setTrackingOrder(order)
    setIsTrackingOpen(true)
  }

  const openCustomerInvoice = (order) => {
    if (!currentUser?.email || !order) return
    setIsOrderHistoryOpen(false)
    setInvoiceOrder(order)
    setIsInvoiceOpen(true)
  }

  const closeTracking = () => {
    setIsTrackingOpen(false)
    setTrackingOrder(null)
  }

  const updateOrderTracking = (orderId, trackingStep, status) => {
    setOrders(current => current.map(order => order.id === orderId ? { ...order, trackingStep, status } : order))
    setTrackingOrder(current => current?.id === orderId ? { ...current, trackingStep, status } : current)
  }


  const handleReorder = async (order) => {
    const customerKey = getCustomerKey(currentUser)
    if (!customerKey || !order?.id) return
    try {
      const result = await api.orders.reorder(customerKey, order.id)
      const serverItems = Array.isArray(result.cart?.items) ? result.cart.items : []
      setCartItems(serverItems.map(item => ({ id: item.itemId, name: item.name, price: item.price, quantity: item.quantity })))
      setIsOrderHistoryOpen(false)
      setIsCartOpen(true)
      if (result.unavailable?.length) window.alert(`${result.message}
Unavailable: ${result.unavailable.join(', ')}`)
    } catch (error) {
      window.alert(error.message || 'Unable to reorder this order.')
    }
  }

  const handleLogout = async () => {
    await api.auth.logout().catch(() => {})
    setCurrentUser(null)
    setFavorites([])
    setCartItems([])
    setOrders([])
    setNotifications([])
    setLoyalty({ points: 0, lifetimePoints: 0, redeemedPoints: 0, history: [] })
  }

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="min-h-screen">
      <Navbar
        favoriteCount={favorites.length}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenOrderHistory={openOrderHistory}
        notificationCount={notifications.filter((item) => !item.read).length}
        onOpenNotifications={openNotifications}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        loyaltyPoints={loyalty.points}
        onOpenLoyalty={openLoyalty}
      />
      <Hero />
      <About />
      <Menu
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
        onAddToCart={addToCart}
        inventory={inventory}
      />
      <AIRecommendations
        currentUser={currentUser}
        orders={orders}
        favorites={favorites}
        cartItems={cartItems}
        inventory={inventory}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
        onOpenAuth={() => setIsAuthOpen(true)}
      />
      <PersonalizedMenu
        currentUser={currentUser}
        orders={orders}
        favorites={favorites}
        inventory={inventory}
        onAddToCart={addToCart}
        onToggleFavorite={toggleFavorite}
      />
      <Gallery />
      <Contact />
      <Footer />
      <WhatsAppButton />
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onIncrease={increaseQuantity}
        onDecrease={decreaseQuantity}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={openCheckout}
      />
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthenticated={handleAuthenticated}
      />
      <OrderHistory
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        orders={orders}
        onReorder={handleReorder}
        reviews={reviews.filter((review) => review.customerEmail === currentUser?.email)}
        onReview={openReview}
        onTrack={openTracking}
        onInvoice={openCustomerInvoice}
      />
      <OrderTracking
        isOpen={isTrackingOpen}
        order={trackingOrder}
        onClose={closeTracking}
        onStatusChange={updateOrderTracking}
      />
      <ReviewModal
        isOpen={isReviewOpen}
        order={reviewOrder}
        existingReview={reviews.find((review) => review.orderId === reviewOrder?.id)}
        onClose={closeReview}
        onSubmit={handleSubmitReview}
      />
      <NotificationPanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkRead={markNotificationRead}
        onMarkAllRead={markAllNotificationsRead}
        onClear={clearNotifications}
        onTrackOrder={(orderId) => {
          const order = orders.find((item) => item.id === orderId)
          if (order) {
            setIsNotificationsOpen(false)
            openTracking(order)
          }
        }}
      />
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onBack={() => setIsAdminDashboardOpen(false)}
        onClose={() => setIsAdminDashboardOpen(false)}
        onOpenOrders={() => {
          setIsAdminDashboardOpen(false)
          setIsOrderManagementOpen(true)
        }}
        onOpenMenu={() => {
          setIsAdminDashboardOpen(false)
          setIsMenuManagementOpen(true)
        }}
        onOpenKitchen={() => {
          setIsAdminDashboardOpen(false)
          setIsKitchenDashboardOpen(true)
        }}
        onOpenInventory={() => {
          setIsAdminDashboardOpen(false)
          setIsInventoryOpen(true)
        }}
        onOpenAnalytics={() => {
          setIsAdminDashboardOpen(false)
          setIsAnalyticsOpen(true)
        }}
        onOpenInvoice={(order = null) => {
          setIsAdminDashboardOpen(false)
          setInvoiceOrder(order)
          setIsInvoiceOpen(true)
        }}
      />
      <MenuManagement
        isOpen={isMenuManagementOpen}
        onBack={() => { setIsMenuManagementOpen(false); setIsAdminDashboardOpen(true) }}
        onClose={() => setIsMenuManagementOpen(false)}
      />
      <OrderManagement
        isOpen={isOrderManagementOpen}
        onBack={() => { setIsOrderManagementOpen(false); setIsAdminDashboardOpen(true) }}
        onClose={() => setIsOrderManagementOpen(false)}
      />
      <KitchenDashboard
        isOpen={isKitchenDashboardOpen}
        onBack={() => { setIsKitchenDashboardOpen(false); setIsAdminDashboardOpen(true) }}
        onClose={() => setIsKitchenDashboardOpen(false)}
      />
      <InventoryManagement
        isOpen={isInventoryOpen}
        onBack={() => { setIsInventoryOpen(false); setIsAdminDashboardOpen(true) }}
        onClose={() => setIsInventoryOpen(false)}
      />
      <Analytics
        isOpen={isAnalyticsOpen}
        onBack={() => { setIsAnalyticsOpen(false); setIsAdminDashboardOpen(true) }}
        onClose={() => setIsAnalyticsOpen(false)}
      />
      <Invoice
        isOpen={isInvoiceOpen}
        order={invoiceOrder}
        onBack={() => { setIsInvoiceOpen(false); setInvoiceOrder(null); setIsAdminDashboardOpen(true) }}
        onClose={() => { setIsInvoiceOpen(false); setInvoiceOrder(null) }}
      />
      <LoyaltyPoints
        isOpen={isLoyaltyOpen}
        onClose={() => setIsLoyaltyOpen(false)}
        currentUser={currentUser}
        loyalty={loyalty}
      />
      <Checkout
        isOpen={isCheckoutOpen}
        onClose={closeCheckout}
        items={cartItems}
        currentUser={currentUser}
        loyaltyPoints={loyalty.points}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  )
}

export default App

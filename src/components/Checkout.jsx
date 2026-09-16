import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { FaArrowLeft, FaClipboardList, FaTimes, FaUser, FaPhone, FaEnvelope, FaMotorcycle, FaStore, FaMapMarkerAlt, FaTag, FaTimesCircle, FaFire, FaMoneyBillWave, FaStar, FaCreditCard, FaClock } from 'react-icons/fa'

const initialForm = {
  name: '',
  phone: '',
  email: '',
  orderType: 'delivery',
  address: '',
  landmark: '',
  pincode: '',
  paymentStatus: 'pending',
}

const Checkout = ({ isOpen, onClose, items = [], currentUser = null, loyaltyPoints = 0, onPlaceOrder }) => {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [couponInput, setCouponInput] = useState('')
  const [couponError, setCouponError] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [appliedOffer, setAppliedOffer] = useState(null)
  const [offerError, setOfferError] = useState('')
  const [loyaltyInput, setLoyaltyInput] = useState('')
  const [loyaltyError, setLoyaltyError] = useState('')
  const [appliedLoyalty, setAppliedLoyalty] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [availableOffers, setAvailableOffers] = useState([])
  const [availableCoupons, setAvailableCoupons] = useState([])

  useEffect(() => {
    if (!isOpen) {
      setForm(initialForm)
      setErrors({})
      setCouponInput('')
      setCouponError('')
      setAppliedCoupon(null)
      setAppliedOffer(null)
      setOfferError('')
      setAvailableCoupons([])
      setLoyaltyInput('')
      setLoyaltyError('')
      setAppliedLoyalty(null)
      setIsSubmitting(false)
      return
    }

    if (currentUser?.email) {
      api.offers.list().then((result) => { setAvailableOffers(Array.isArray(result.offers) ? result.offers : []) }).catch(() => setAvailableOffers([]))
      api.coupons.list().then((result) => { setAvailableCoupons(Array.isArray(result.coupons) ? result.coupons : []) }).catch(() => setAvailableCoupons([]))
    }

    setForm({
      name: currentUser?.name || '',
      phone: currentUser?.phone || '',
      email: currentUser?.email || '',
      orderType: 'delivery',
      address: currentUser?.address || '',
      landmark: currentUser?.landmark || '',
      pincode: currentUser?.pincode || '',
      paymentStatus: 'pending',
    })
    setErrors({})
    setCouponInput('')
    setCouponError('')
    setAppliedCoupon(null)
    setAppliedOffer(null)
    setOfferError('')
    setAvailableCoupons([])
    setLoyaltyInput('')
    setLoyaltyError('')
    setAppliedLoyalty(null)
    setIsSubmitting(false)
  }, [isOpen, currentUser])

  const totalItems = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items])
  const subtotal = useMemo(() => items.reduce((total, item) => total + item.price * item.quantity, 0), [items])

  const couponDiscount = appliedCoupon?.discount || 0
  const offerDiscount = appliedOffer?.discount || 0
  const promotionDiscount = appliedCoupon ? couponDiscount : offerDiscount
  const totalBeforeLoyalty = Math.max(0, subtotal - promotionDiscount)
  const maxLoyaltyPoints = Math.min(Number(loyaltyPoints || 0), Math.floor((totalBeforeLoyalty * 0.2) / 100) * 100)
  const loyaltyDiscount = appliedLoyalty?.discount || 0
  const finalTotal = Math.max(0, totalBeforeLoyalty - loyaltyDiscount)

  const applyCoupon = async () => {
    const code = couponInput.trim().toUpperCase()
    setCouponError('')
    if (appliedOffer) { setCouponError('Remove the active offer before applying a coupon.'); return }
    if (!code) { setCouponError('Enter a coupon code.'); return }
    if (!currentUser?.email) { setCouponError('Please log in to apply a coupon.'); return }
    try {
      const result = await api.coupons.validate(code, subtotal)
      setAppliedCoupon(result.coupon)
      setCouponInput(result.coupon.code)
    } catch (error) {
      setCouponError(error?.message || 'Unable to validate coupon.')
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const applyOffer = async (offer) => {
    setOfferError('')
    if (appliedCoupon) { setOfferError('Remove the active coupon before applying an offer.'); return }
    if (!currentUser?.email) { setOfferError('Please log in to apply an offer.'); return }
    try {
      const result = await api.offers.validate(offer.code || offer.id, subtotal)
      setAppliedOffer(result.offer)
    } catch (error) {
      setOfferError(error?.message || 'Unable to validate offer.')
    }
  }

  const removeOffer = () => {
    setAppliedOffer(null)
    setOfferError('')
  }

  const applyLoyalty = () => {
    setLoyaltyError('')
    const requested = Number.parseInt(loyaltyInput, 10)
    if (!currentUser?.email) {
      setLoyaltyError('Please log in to use loyalty points.')
      return
    }
    if (!Number.isFinite(requested) || requested < 100 || requested % 100 !== 0) {
      setLoyaltyError('Enter points in multiples of 100.')
      return
    }
    if (requested > maxLoyaltyPoints) {
      setLoyaltyError(`You can use up to ${maxLoyaltyPoints.toLocaleString('en-IN')} points on this order.`)
      return
    }
    const discount = requested / 10
    setAppliedLoyalty({ points: requested, discount })
    setLoyaltyInput(String(requested))
  }

  const removeLoyalty = () => {
    setAppliedLoyalty(null)
    setLoyaltyInput('')
    setLoyaltyError('')
  }

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: '' }))
  }

  const validate = () => {
    const nextErrors = {}
    const name = form.name.trim()
    const phone = form.phone.replace(/\D/g, '')
    const email = form.email.trim()

    if (name.length < 2) nextErrors.name = 'Please enter your name.'
    if (phone.length !== 10) nextErrors.phone = 'Enter a valid 10-digit phone number.'
    if (email && !/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Enter a valid email address.'

    if (form.orderType === 'delivery') {
      if (form.address.trim().length < 8) nextErrors.address = 'Please enter your complete delivery address.'
      if (form.pincode.replace(/\D/g, '').length !== 6) nextErrors.pincode = 'Enter a valid 6-digit pincode.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (isSubmitting) return
    if (!validate()) return
    setIsSubmitting(true)
    onPlaceOrder?.(form, appliedCoupon, appliedOffer, appliedLoyalty)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full px-4 py-6 sm:py-10">
        <div className="max-w-6xl mx-auto bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-800">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Checkout</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close checkout" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors">
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1.35fr_0.9fr]">
            <div className="p-5 sm:p-8">
              <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center"><FaUser className="text-white" aria-hidden="true" /></div>
                <div><h3 className="text-xl font-semibold text-white">Customer Details</h3><p className="text-sm text-gray-500">Enter your details to continue.</p></div>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative"><FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="checkout-name" type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter your full name" autoComplete="name" disabled={Boolean(currentUser)} aria-readonly={Boolean(currentUser)} className={`w-full bg-gray-900 border ${errors.name ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-950`} /></div>
                  {errors.name && <p className="text-red-400 text-xs mt-2">{errors.name}</p>}
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="relative"><FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="checkout-phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit phone number" autoComplete="tel" disabled={Boolean(currentUser)} aria-readonly={Boolean(currentUser)} className={`w-full bg-gray-900 border ${errors.phone ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-950`} /></div>
                  {errors.phone && <p className="text-red-400 text-xs mt-2">{errors.phone}</p>}
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-300 mb-2">Email <span className="text-gray-600">(optional)</span></label>
                  <div className="relative"><FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="checkout-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="you@example.com" autoComplete="email" disabled={Boolean(currentUser)} aria-readonly={Boolean(currentUser)} className={`w-full bg-gray-900 border ${errors.email ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-950`} /></div>
                  {errors.email && <p className="text-red-400 text-xs mt-2">{errors.email}</p>}
                </div>

                {currentUser && (
                  <p className="text-xs text-gray-600 -mt-2">Your account details are pre-filled. You can edit only the delivery address, landmark, and pincode for this order.</p>
                )}

                <div>
                  <p className="block text-sm font-medium text-gray-300 mb-3">Order Type</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button type="button" onClick={() => updateField('orderType', 'delivery')} aria-pressed={form.orderType === 'delivery'} className={`rounded-xl border p-4 text-left transition-colors ${form.orderType === 'delivery' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
                      <div className="flex items-center gap-3"><FaMotorcycle className={form.orderType === 'delivery' ? 'text-primary' : 'text-gray-500'} /><div><p className="font-semibold text-white">Delivery</p><p className="text-xs text-gray-500 mt-1">Get your order delivered</p></div></div>
                    </button>
                    <button type="button" onClick={() => updateField('orderType', 'pickup')} aria-pressed={form.orderType === 'pickup'} className={`rounded-xl border p-4 text-left transition-colors ${form.orderType === 'pickup' ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-900 hover:border-gray-600'}`}>
                      <div className="flex items-center gap-3"><FaStore className={form.orderType === 'pickup' ? 'text-primary' : 'text-gray-500'} /><div><p className="font-semibold text-white">Pickup</p><p className="text-xs text-gray-500 mt-1">Collect from RDX Fast Food</p></div></div>
                    </button>
                  </div>
                </div>

                {form.orderType === 'delivery' ? (
                  <div className="space-y-5 rounded-2xl border border-gray-800 bg-gray-900/50 p-4 sm:p-5">
                    <div className="flex items-center gap-2"><FaMapMarkerAlt className="text-primary" aria-hidden="true" /><h4 className="text-white font-semibold">Delivery Address</h4></div>
                    <div>
                      <label htmlFor="checkout-address" className="block text-sm font-medium text-gray-300 mb-2">Complete Address</label>
                      <textarea id="checkout-address" rows="3" value={form.address} onChange={(event) => updateField('address', event.target.value)} placeholder="House / shop no., street, area" autoComplete="street-address" className={`w-full bg-gray-900 border ${errors.address ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none`} />
                      {errors.address && <p className="text-red-400 text-xs mt-2">{errors.address}</p>}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="checkout-landmark" className="block text-sm font-medium text-gray-300 mb-2">Landmark <span className="text-gray-600">(optional)</span></label>
                        <input id="checkout-landmark" type="text" value={form.landmark} onChange={(event) => updateField('landmark', event.target.value)} placeholder="Nearby landmark" autoComplete="off" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                      </div>
                      <div>
                        <label htmlFor="checkout-pincode" className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                        <input id="checkout-pincode" type="tel" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" autoComplete="postal-code" className={`w-full bg-gray-900 border ${errors.pincode ? 'border-red-500' : 'border-gray-700'} rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors`} />
                        {errors.pincode && <p className="text-red-400 text-xs mt-2">{errors.pincode}</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5">
                    <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0"><FaStore className="text-primary" aria-hidden="true" /></div><div><h4 className="text-white font-semibold">Pickup from RDX Fast Food</h4><p className="text-sm text-gray-500 mt-1">Your order will be prepared for pickup. We'll confirm the pickup time in the next step.</p></div></div>
                  </div>
                )}


                <div className="pt-3">
                  <button type="submit" disabled={items.length === 0 || isSubmitting} className="w-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 rounded-full font-semibold text-lg hover:scale-[1.01] transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSubmitting ? 'Placing Order...' : '🛒 Place Order'}</button>
                  <button type="button" onClick={onClose} className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-white transition-colors flex items-center justify-center gap-2"><FaArrowLeft aria-hidden="true" /> Back to Cart</button>
                </div>
              </form>
            </div>

            <aside className="border-t lg:border-t-0 lg:border-l border-gray-800 bg-gray-900/60 p-5 sm:p-8">
            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center"><FaFire className="text-primary" aria-hidden="true" /></div>
                  <div><h3 className="text-white font-semibold">🔥 Special Offers</h3><p className="text-xs text-gray-500 mt-1">Choose one offer for this order.</p></div>
                </div>
                {appliedOffer ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
                    <div><p className="text-primary font-bold tracking-wide">{appliedOffer.title}</p><p className="text-xs text-gray-500 mt-1">You saved ₹{appliedOffer.discount}</p></div>
                    <button type="button" onClick={removeOffer} className="text-gray-400 hover:text-red-400 transition-colors" aria-label="Remove offer"><FaTimesCircle /></button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableOffers.map((offer) => (
                      <button key={offer.id} type="button" onClick={() => applyOffer(offer)} disabled={Boolean(appliedCoupon) || offer.alreadyUsed} className="w-full text-left rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-3 hover:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="flex items-center justify-between gap-3"><span className="text-primary font-semibold text-sm">{offer.title}</span><span className="text-xs text-gray-600">₹{offer.minOrder}+</span></div>
                        <p className="text-xs text-gray-500 mt-1">{offer.alreadyUsed ? 'Already used on this account' : offer.description}</p>
                      </button>
                    ))}
                    {offerError && <p className="text-red-400 text-xs mt-2">{offerError}</p>}
                  </div>
                )}
              </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center"><FaTag className="text-primary" aria-hidden="true" /></div>
                  <div><h3 className="text-white font-semibold">Have a Coupon?</h3><p className="text-xs text-gray-500 mt-1">{appliedOffer ? 'Remove the active offer before using a coupon.' : 'Apply a valid code to save on this order.'}</p></div>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
                    <div><p className="text-primary font-bold tracking-wide">{appliedCoupon.code}</p><p className="text-xs text-gray-500 mt-1">You saved ₹{appliedCoupon.discount}</p></div>
                    <button type="button" onClick={removeCoupon} className="text-gray-400 hover:text-red-400 transition-colors" aria-label="Remove coupon"><FaTimesCircle /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input type="text" disabled={Boolean(appliedOffer)} value={couponInput} onChange={(event) => { setCouponInput(event.target.value.toUpperCase()); setCouponError('') }} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); applyCoupon() } }} placeholder="Enter coupon code" className="min-w-0 flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary uppercase" aria-label="Coupon code" />
                      <button type="button" disabled={Boolean(appliedOffer)} onClick={applyCoupon} className="px-4 py-3 rounded-xl border border-primary/50 text-primary font-semibold hover:bg-primary/10 transition-colors">Apply</button>
                    </div>
                    {couponError && <p className="text-red-400 text-xs mt-2">{couponError}</p>}
                    <div className="mt-4 space-y-2">
                      {availableCoupons.map((coupon) => <button key={coupon.code} type="button" disabled={Boolean(appliedOffer) || coupon.alreadyUsed} onClick={() => setCouponInput(coupon.code)} className="w-full text-left rounded-xl border border-gray-800 bg-gray-900/60 px-3 py-2.5 hover:border-gray-700 transition-colors"><span className="text-primary font-semibold text-sm">{coupon.code}</span><span className="text-xs text-gray-500 ml-2">{coupon.alreadyUsed ? 'Already used on this account' : coupon.label}</span></button>)}
                    </div>
                  </>
                )}
              </div>

              <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 sm:p-5 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center"><FaStar className="text-primary" aria-hidden="true" /></div>
                  <div><h3 className="text-white font-semibold">⭐ Loyalty Points</h3><p className="text-xs text-gray-500 mt-1">Balance: {Number(loyaltyPoints || 0).toLocaleString('en-IN')} points · 100 points = ₹10</p></div>
                </div>
                {appliedLoyalty ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-3">
                    <div><p className="text-primary font-bold">{appliedLoyalty.points} points used</p><p className="text-xs text-gray-500 mt-1">You saved ₹{appliedLoyalty.discount}</p></div>
                    <button type="button" onClick={removeLoyalty} className="text-gray-400 hover:text-red-400 transition-colors" aria-label="Remove loyalty points"><FaTimesCircle /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input type="number" min="100" step="100" max={maxLoyaltyPoints || 100} value={loyaltyInput} onChange={(event) => { setLoyaltyInput(event.target.value); setLoyaltyError('') }} placeholder="Points to use" disabled={!currentUser || maxLoyaltyPoints < 100} className="min-w-0 flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary disabled:opacity-50" aria-label="Loyalty points to use" />
                      <button type="button" onClick={applyLoyalty} disabled={!currentUser || maxLoyaltyPoints < 100} className="px-4 py-3 rounded-xl border border-primary/50 text-primary font-semibold hover:bg-primary/10 transition-colors disabled:opacity-50">Use</button>
                    </div>
                    {maxLoyaltyPoints >= 100 ? <p className="text-xs text-gray-600 mt-2">You can use up to {maxLoyaltyPoints.toLocaleString('en-IN')} points on this order (max 20% of the order value).</p> : <p className="text-xs text-gray-600 mt-2">At least 100 points and a ₹50+ eligible order value are needed to redeem points.</p>}
                    {loyaltyError && <p className="text-red-400 text-xs mt-2">{loyaltyError}</p>}
                  </>
                )}
              </div>

              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"><FaClipboardList className="text-primary" aria-hidden="true" /></div><div><h3 className="text-xl font-semibold text-white">Order Summary</h3><p className="text-sm text-gray-500">{totalItems} item{totalItems !== 1 ? 's' : ''}</p></div></div>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-gray-800 pb-3"><div className="min-w-0"><p className="text-white font-medium truncate">{item.name}</p><p className="text-xs text-gray-500 mt-1">₹{item.price} × {item.quantity}</p></div><p className="text-white font-semibold shrink-0">₹{item.price * item.quantity}</p></div>
                ))}
              </div>
              <div className="border-t border-gray-800 mt-5 pt-5 space-y-3">
                <div className="flex items-center justify-between"><span className="text-gray-400">Subtotal</span><span className="text-white font-semibold">₹{subtotal}</span></div>
                {appliedCoupon && <div className="flex items-center justify-between"><span className="text-gray-400">Coupon ({appliedCoupon.code})</span><span className="text-green-400 font-semibold">-₹{couponDiscount}</span></div>}
                {appliedOffer && <div className="flex items-center justify-between"><span className="text-gray-400">Offer ({appliedOffer.title})</span><span className="text-green-400 font-semibold">-₹{offerDiscount}</span></div>}
                {appliedLoyalty && <div className="flex items-center justify-between"><span className="text-gray-400">Loyalty Points ({appliedLoyalty.points})</span><span className="text-green-400 font-semibold">-₹{loyaltyDiscount}</span></div>}
                <div className="flex items-center justify-between border-t border-gray-800 pt-4"><span className="text-gray-300 font-semibold">Total</span><span className="text-2xl font-bold text-white">₹{finalTotal}</span></div>
                <div className="mt-4 rounded-xl bg-gray-950 border border-gray-800 p-4"><p className="text-xs uppercase tracking-wider text-gray-600">Order Type</p><p className="text-white font-semibold mt-1 flex items-center gap-2">{form.orderType === 'delivery' ? <FaMotorcycle className="text-primary" /> : <FaStore className="text-primary" />}{form.orderType === 'delivery' ? 'Delivery' : 'Pickup'}</p></div>

                <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center"><FaMoneyBillWave className="text-primary" /></div>
                    <div><h4 className="text-white font-semibold">Bill Payment</h4><p className="text-xs text-gray-500 mt-1">Select how the bill is marked for this order.</p></div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    {[
                      { value: 'cash', label: 'Cash', icon: FaMoneyBillWave, note: 'Paid by cash' },
                      { value: 'online', label: 'Online', icon: FaCreditCard, note: 'Paid online' },
                      { value: 'pending', label: 'Pending', icon: FaClock, note: 'Payment pending' },
                    ].map(({ value, label, icon: Icon, note }) => (
                      <button key={value} type="button" onClick={() => updateField('paymentStatus', value)} aria-pressed={form.paymentStatus === value} className={`rounded-xl border p-3 text-left transition-colors ${form.paymentStatus === value ? 'border-primary bg-primary/10' : 'border-gray-700 bg-gray-950 hover:border-gray-600'}`}>
                        <div className="flex items-center gap-2"><Icon className={form.paymentStatus === value ? 'text-primary' : 'text-gray-500'} /><span className="text-white font-semibold text-sm">{label}</span></div>
                        <p className="text-xs text-gray-600 mt-1">{note}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-3">Your order will be saved immediately after you place it.</p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout

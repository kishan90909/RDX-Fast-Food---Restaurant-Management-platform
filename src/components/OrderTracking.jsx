import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { FaCheck, FaClock, FaMapMarkerAlt, FaMotorcycle, FaStore, FaTimes, FaUtensils } from 'react-icons/fa'

const DELIVERY_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', icon: FaClock },
  { key: 'Preparing', label: 'Preparing', icon: FaUtensils },
  { key: 'Ready', label: 'Ready', icon: FaCheck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: FaMotorcycle },
  { key: 'Delivered', label: 'Delivered', icon: FaCheck },
]

const PICKUP_STEPS = [
  { key: 'Order Placed', label: 'Order Placed', icon: FaClock },
  { key: 'Preparing', label: 'Preparing', icon: FaUtensils },
  { key: 'Ready for Pickup', label: 'Ready for Pickup', icon: FaStore },
  { key: 'Picked Up', label: 'Picked Up', icon: FaCheck },
]

const OrderTracking = ({ isOpen, order, onClose, onStatusChange }) => {
  const [activeStep, setActiveStep] = useState(0)
  const onStatusChangeRef = useRef(onStatusChange)

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange
  }, [onStatusChange])

  const steps = useMemo(
    () => (order?.orderType === 'pickup' ? PICKUP_STEPS : DELIVERY_STEPS),
    [order?.orderType]
  )

  useEffect(() => {
    if (!order) return undefined
    let cancelled = false
    const applyOrder = (nextOrder) => {
      const savedIndex = Number.isInteger(Number(nextOrder?.trackingStep)) ? Number(nextOrder.trackingStep) : 0
      setActiveStep(Math.min(Math.max(savedIndex, 0), steps.length - 1))
    }
    applyOrder(order)

    const refresh = async () => {
      try {
        const result = await api.orders.get('me', order.id)
        if (cancelled || !result?.order) return
        applyOrder(result.order)
        if (onStatusChangeRef.current) onStatusChangeRef.current(result.order.orderId || order.id, result.order.trackingStep, result.order.status)
      } catch {
        // Keep the last known backend state visible if a polling request fails.
      }
    }

    refresh()
    const timer = window.setInterval(refresh, 5000)
    return () => { cancelled = true; window.clearInterval(timer) }
  }, [order?.id, steps.length])


  if (!isOpen || !order) return null

  const currentStep = steps[activeStep]
  const CurrentStepIcon = currentStep.icon
  const progress = steps.length > 1 ? (activeStep / (steps.length - 1)) * 100 : 100

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full px-4 py-6 sm:py-10 flex items-start justify-center">
        <div className="w-full max-w-2xl bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-8 py-5 border-b border-gray-800">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Track Order</h2>
              <p className="text-xs text-gray-500 mt-2">{order.id}</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Close order tracking" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors">
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="p-5 sm:p-8 space-y-6">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-500">Current Status</p>
                  <p className="text-xl font-bold text-white mt-1">{currentStep.label}</p>
                  <p className="text-sm text-gray-500 mt-1">Your order is moving through the preparation process.</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-900 border border-primary/30 flex items-center justify-center text-primary shrink-0">
                  <CurrentStepIcon aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5 h-2 rounded-full bg-gray-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-5 sm:p-6">
              <div className="relative">
                <div className="absolute left-[19px] top-5 bottom-5 w-px bg-gray-800" />
                <div className="space-y-6">
                  {steps.map((step, index) => {
                    const StepIcon = step.icon
                    const complete = index <= activeStep
                    const current = index === activeStep
                    return (
                      <div key={step.key} className="relative flex items-center gap-4">
                        <div className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-colors ${complete ? 'bg-primary/15 border-primary text-primary' : 'bg-gray-950 border-gray-700 text-gray-600'}`}>
                          <StepIcon aria-hidden="true" />
                        </div>
                        <div>
                          <p className={`font-semibold ${complete ? 'text-white' : 'text-gray-600'}`}>{step.label}</p>
                          {current && <p className="text-xs text-primary mt-1">Current status</p>}
                          {index < activeStep && <p className="text-xs text-gray-600 mt-1">Completed</p>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-600">Order Type</p>
                <p className="text-white font-semibold mt-2 flex items-center gap-2">
                  {order.orderType === 'delivery' ? <FaMotorcycle className="text-primary" /> : <FaStore className="text-primary" />}
                  {order.orderType === 'delivery' ? 'Delivery' : 'Pickup'}
                </p>
              </div>
              <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-600">Order Total</p>
                <p className="text-white font-bold text-lg mt-2">₹{order.total ?? order.subtotal}</p>
              </div>
            </div>

            {order.orderType === 'delivery' && order.address && (
              <div className="rounded-xl bg-gray-950 border border-gray-800 p-4 flex items-start gap-3">
                <FaMapMarkerAlt className="text-primary mt-1 shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-white">Delivery Address</p>
                  <p className="text-sm text-gray-400 mt-1">{order.address}</p>
                  {order.landmark && <p className="text-xs text-gray-500 mt-1">Landmark: {order.landmark}</p>}
                  {order.pincode && <p className="text-xs text-gray-500 mt-1">Pincode: {order.pincode}</p>}
                </div>
              </div>
            )}

            <p className="text-xs text-gray-600 text-center">Live tracking is powered by the RDX Fast Food backend.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking

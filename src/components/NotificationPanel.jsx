import { useEffect } from 'react'
import { FaBell, FaCheck, FaCheckCircle, FaTimes, FaTrash, FaTruck, FaTag, FaInfoCircle } from 'react-icons/fa'

const iconFor = (type) => {
  if (type === 'tracking') return FaTruck
  if (type === 'promotion') return FaTag
  if (type === 'order') return FaCheckCircle
  return FaInfoCircle
}

const NotificationPanel = ({ isOpen, onClose, notifications = [], onMarkRead, onMarkAllRead, onClear, onTrackOrder }) => {
  useEffect(() => {
    if (!isOpen) return undefined
    onMarkAllRead?.()
    return undefined
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="absolute right-4 top-24 w-[min(92vw,420px)] rounded-2xl bg-gray-950 border border-gray-800 shadow-2xl overflow-hidden" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary"><FaBell /></div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-xs text-gray-500">Updates about your orders and offers</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close notifications" className="w-9 h-9 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center"><FaTimes /></button>
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-900">
          <button type="button" onClick={onMarkAllRead} className="text-xs text-primary hover:text-white transition-colors">Mark all as read</button>
          {notifications.length > 0 && <button type="button" onClick={onClear} className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"><FaTrash /> Clear all</button>}
        </div>

        <div className="max-h-[65vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FaBell className="mx-auto text-3xl text-gray-700" />
              <p className="text-white font-semibold mt-4">No notifications</p>
              <p className="text-sm text-gray-600 mt-1">You're all caught up.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-900">
              {notifications.map((notification) => {
                const Icon = iconFor(notification.type)
                return (
                  <div key={notification.id} className={`p-4 transition-colors ${notification.read ? 'bg-gray-950' : 'bg-primary/[0.04]'}`}>
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center text-primary shrink-0"><Icon /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{notification.title}</p>
                            <p className="text-sm text-gray-400 mt-1">{notification.message}</p>
                          </div>
                          {!notification.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" aria-label="Unread" />}
                        </div>
                        <p className="text-[11px] text-gray-600 mt-2">{new Date(notification.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        <div className="flex items-center gap-3 mt-3">
                          {notification.orderId && notification.type === 'tracking' && <button type="button" onClick={() => onTrackOrder?.(notification.orderId)} className="text-xs text-primary hover:text-white transition-colors">Track Order</button>}
                          {!notification.read && <button type="button" onClick={() => onMarkRead?.(notification.id)} className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"><FaCheck /> Mark read</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationPanel

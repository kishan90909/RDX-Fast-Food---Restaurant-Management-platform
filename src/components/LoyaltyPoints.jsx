import { FaArrowLeft, FaGift, FaHistory, FaStar, FaTimes } from 'react-icons/fa'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

const LoyaltyPoints = ({ isOpen, onClose, currentUser, loyalty }) => {
  if (!isOpen || !currentUser) return null

  const points = Number(loyalty?.points || 0)
  const lifetimePoints = Number(loyalty?.lifetimePoints || 0)
  const redeemedPoints = Number(loyalty?.redeemedPoints || 0)
  const history = Array.isArray(loyalty?.history) ? [...loyalty.history].reverse() : []
  const nextReward = 100
  const progress = Math.min(100, (points / nextReward) * 100)

  return (
    <div className="fixed inset-0 z-[140] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-10 flex items-start justify-center">
        <div className="w-full max-w-3xl rounded-3xl overflow-hidden border border-gray-800 bg-gray-950 shadow-2xl">
          <header className="flex items-center justify-between gap-4 px-5 sm:px-7 py-5 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <FaStar className="text-white" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">Loyalty Points</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close loyalty points" className="w-10 h-10 rounded-full border border-gray-700 bg-gray-900 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center">
              <FaTimes aria-hidden="true" />
            </button>
          </header>

          <main className="p-5 sm:p-7 space-y-6">
            <section className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-secondary/10 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                <div>
                  <p className="text-sm text-gray-400">Available points</p>
                  <p className="text-4xl sm:text-5xl font-black text-white mt-1">{points.toLocaleString('en-IN')}</p>
                  <p className="text-sm text-primary mt-2">100 points = ₹10</p>
                </div>
                <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center bg-gray-950/60">
                  <FaGift className="text-3xl text-primary" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                  <span>Next ₹10 reward</span>
                  <span>{Math.min(points, nextReward)}/{nextReward} points</span>
                </div>
                <div className="h-2 rounded-full bg-gray-900 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </section>

            <section className="grid sm:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-600">Lifetime earned</p>
                <p className="text-xl font-bold text-white mt-2">{lifetimePoints.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-600">Redeemed</p>
                <p className="text-xl font-bold text-white mt-2">{redeemedPoints.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-4">
                <p className="text-xs uppercase tracking-wider text-gray-600">Reward value</p>
                <p className="text-xl font-bold text-primary mt-2">{money(Math.floor(points / 10))}</p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-950 p-5">
              <div className="flex items-center gap-3 mb-4">
                <FaHistory className="text-primary" aria-hidden="true" />
                <div>
                  <h3 className="text-white font-semibold">Points History</h3>
                  <p className="text-xs text-gray-500 mt-1">Earned and redeemed points for your account.</p>
                </div>
              </div>
              {history.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-800 p-6 text-center text-gray-500 text-sm">
                  No points activity yet. Place an order to start earning points.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-gray-800 bg-gray-900/50 px-4 py-3">
                      <div>
                        <p className="text-sm text-white font-medium">{item.type === 'earned' ? 'Points earned' : 'Points redeemed'}</p>
                        <p className="text-xs text-gray-600 mt-1">{item.orderId || 'Order'} · {item.date ? new Date(item.date).toLocaleString('en-IN') : 'Recently'}</p>
                      </div>
                      <span className={`font-bold ${item.type === 'earned' ? 'text-green-400' : 'text-primary'}`}>
                        {item.type === 'earned' ? '+' : '-'}{Number(item.points || 0)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900/50 p-4 sm:p-5">
              <p className="text-sm text-white font-semibold">How Loyalty Points work</p>
              <div className="grid sm:grid-cols-2 gap-3 mt-3 text-xs text-gray-500">
                <p>⭐ Earn <strong className="text-gray-300">1 point for every ₹50</strong> spent after coupon/offer discounts.</p>
                <p>🎁 Redeem points during checkout. <strong className="text-gray-300">100 points = ₹10</strong> discount.</p>
              </div>
            </section>

            <button type="button" onClick={onClose} className="w-full py-3 rounded-full border border-gray-700 text-gray-300 hover:text-white hover:border-primary/50 transition-colors flex items-center justify-center gap-2">
              <FaArrowLeft aria-hidden="true" /> Back
            </button>
          </main>
        </div>
      </div>
    </div>
  )
}

export default LoyaltyPoints

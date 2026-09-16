import { FaMinus, FaPlus, FaTrash, FaTimes, FaShoppingCart } from 'react-icons/fa'

const Cart = ({ isOpen, onClose, items = [], onIncrease, onDecrease, onRemove, onClear, onCheckout = () => {} }) => {
  const totalItems = items.reduce((total, item) => total + item.quantity, 0)
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0)

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-gray-950 border-l border-gray-800 shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FaShoppingCart className="text-primary" aria-hidden="true" />
              Your Cart
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center mb-5">
              <FaShoppingCart className="text-3xl text-gray-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Your cart is empty</h3>
            <p className="text-gray-500 max-w-xs">
              Add your favorite food from the menu and it will appear here.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full font-semibold hover:scale-105 transition-transform"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-900 border border-gray-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold truncate">{item.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                      <p className="text-primary font-bold mt-2">₹{item.price}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                      className="text-gray-500 hover:text-red-400 transition-colors shrink-0"
                    >
                      <FaTrash aria-hidden="true" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-gray-700 rounded-full overflow-hidden">
                      <button
                        type="button"
                        onClick={() => onDecrease(item.id)}
                        aria-label={`Decrease quantity of ${item.name}`}
                        className={`w-9 h-9 flex items-center justify-center transition-colors ${
                          item.quantity <= 1
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'text-gray-300 hover:text-primary hover:bg-gray-800'
                        }`}
                        disabled={item.quantity <= 1}
                      >
                        <FaMinus className="text-xs" aria-hidden="true" />
                      </button>
                      <span
                        className="w-10 text-center text-white font-semibold"
                        aria-live="polite"
                        aria-label={`Quantity: ${item.quantity}`}
                      >
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => onIncrease(item.id)}
                        aria-label={`Increase quantity of ${item.name}`}
                        className="w-9 h-9 flex items-center justify-center text-gray-300 hover:text-primary hover:bg-gray-800 transition-colors"
                      >
                        <FaPlus className="text-xs" aria-hidden="true" />
                      </button>
                    </div>
                    <p className="text-white font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-800 px-6 py-5 bg-gray-950">
              <div className="flex items-center justify-between text-gray-400 mb-2">
                <span>Subtotal</span>
                <span className="text-white font-semibold">₹{subtotal}</span>
              </div>
              <p className="text-xs text-gray-600 mb-4">Taxes and delivery charges will be calculated at checkout.</p>

              <button
                type="button"
                onClick={onCheckout}
                className="w-full bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full font-semibold text-lg hover:scale-[1.02] transition-transform"
              >
                Proceed to Checkout
              </button>

              <button
                type="button"
                onClick={onClear}
                className="w-full mt-3 py-2 text-sm text-gray-500 hover:text-red-400 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}

export default Cart

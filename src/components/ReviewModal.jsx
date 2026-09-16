import { useEffect, useState } from 'react'
import { FaStar, FaTimes } from 'react-icons/fa'

const ReviewModal = ({ isOpen, order, existingReview, onClose, onSubmit }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setRating(existingReview?.rating || 0)
      setComment(existingReview?.comment || '')
      setError('')
    }
  }, [isOpen, existingReview])

  if (!isOpen || !order) return null

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!rating) {
      setError('Please select a rating.')
      return
    }
    if (!comment.trim()) {
      setError('Please write a short review.')
      return
    }
    onSubmit({ rating, comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-gray-800">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">{existingReview ? 'Edit Review' : 'Rate Your Order'}</h2>
            <p className="text-xs text-gray-500 mt-1">Order {order.id}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close review" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors">
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
          <div>
            <p className="text-sm font-semibold text-white">How was your experience?</p>
            <div className="flex items-center gap-2 mt-4" role="radiogroup" aria-label="Order rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setRating(value); setError('') }}
                  aria-label={`${value} star${value > 1 ? 's' : ''}`}
                  aria-pressed={rating === value}
                  className="text-2xl sm:text-3xl transition-transform hover:scale-110"
                >
                  <FaStar className={value <= rating ? 'text-primary' : 'text-gray-700'} aria-hidden="true" />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{rating ? `${rating}/5 selected` : 'Select a rating'}</p>
          </div>

          <div>
            <label htmlFor="review-comment" className="block text-sm font-semibold text-white mb-2">Your review</label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => { setComment(event.target.value); setError('') }}
              rows={5}
              maxLength={500}
              placeholder="Tell us what you liked about your order..."
              className="w-full rounded-xl bg-gray-900 border border-gray-800 text-white placeholder:text-gray-600 px-4 py-3 outline-none focus:border-primary/60 resize-none"
            />
            <p className="text-xs text-gray-600 text-right mt-1">{comment.length}/500</p>
          </div>

          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary px-6 py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform">
            {existingReview ? 'Update Review' : 'Submit Review'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal

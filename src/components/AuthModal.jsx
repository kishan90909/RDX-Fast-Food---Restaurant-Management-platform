import { useEffect, useState } from 'react'
import { FaTimes, FaUser, FaEnvelope, FaLock, FaCheckCircle, FaPhone, FaMapMarkerAlt, FaKey } from 'react-icons/fa'
import { api } from '../api'

const initialForm = { name: '', phone: '', email: '', password: '', address: '', landmark: '', pincode: '' }

const AuthModal = ({ isOpen, onClose, onAuthenticated }) => {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [authMethod, setAuthMethod] = useState('password')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setMode('login')
      setForm(initialForm)
      setError('')
      setSuccess('')
      setAuthMethod('password')
      setOtp('')
      setOtpSent(false)
      setLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
    setSuccess('')
  }

  const finishAuthentication = (result) => {
    setSuccess(result.message || 'Authentication successful.')
    setTimeout(() => onAuthenticated(result.user), 300)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    const name = form.name.trim()
    const email = form.email.trim().toLowerCase()
    const password = form.password
    const phone = form.phone.replace(/\D/g, '')
    const address = form.address.trim()
    const landmark = form.landmark.trim()
    const pincode = form.pincode.replace(/\D/g, '')

    if (!/^\S+@\S+\.\S+$/.test(email)) { setError('Please enter a valid email address.'); return }
    if (mode === 'signup') {
      if (name.length < 2) { setError('Please enter your name.'); return }
      if (phone.length !== 10) { setError('Enter a valid 10-digit phone number.'); return }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      if (address.length < 8) { setError('Please enter your complete address.'); return }
      if (pincode.length !== 6) { setError('Enter a valid 6-digit pincode.'); return }
    }

    setLoading(true)
    try {
      if (mode === 'signup') {
        const result = await api.auth.register({ name, phone, email, password, address, landmark, pincode })
        finishAuthentication(result)
        return
      }
      if (authMethod === 'otp') {
        if (!otpSent) {
          const result = await api.auth.requestOtp(email)
          setOtpSent(true)
          setSuccess(result.devOtp ? `OTP generated for development: ${result.devOtp}` : result.message)
          return
        }
        if (!/^\d{6}$/.test(otp)) { setError('Enter the valid 6-digit OTP.'); return }
        const result = await api.auth.verifyOtp(email, otp)
        finishAuthentication(result)
        return
      }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
      const result = await api.auth.login({ email, password })
      finishAuthentication(result)
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setSuccess('')
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 sm:px-7 py-5 border-b border-gray-800">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary font-semibold">RDX Fast Food</p>
              <h2 className="text-2xl font-bold text-white mt-1">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Close login and signup" className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 text-gray-300 hover:text-primary hover:border-primary/50 flex items-center justify-center transition-colors">
              <FaTimes aria-hidden="true" />
            </button>
          </div>

          <div className="p-5 sm:p-7">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-900 border border-gray-800 mb-6">
              <button type="button" onClick={() => switchMode('login')} aria-pressed={mode === 'login'} className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${mode === 'login' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'text-gray-500 hover:text-white'}`}>Login</button>
              <button type="button" onClick={() => switchMode('signup')} aria-pressed={mode === 'signup'} className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'text-gray-500 hover:text-white'}`}>Sign Up</button>
            </div>

            {mode === 'login' && (
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-900 border border-gray-800 mb-6">
                <button type="button" onClick={() => { setAuthMethod('password'); setOtpSent(false); setOtp(''); setError(''); setSuccess('') }} className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${authMethod === 'password' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}>Password</button>
                <button type="button" onClick={() => { setAuthMethod('otp'); setOtpSent(false); setOtp(''); setError(''); setSuccess('') }} className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${authMethod === 'otp' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-white'}`}>OTP Login</button>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <div className="relative"><FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="auth-name" type="text" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Enter your full name" autoComplete="name" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" /></div>
                </div>
              )}

              {mode === 'signup' && (
                <div>
                  <label htmlFor="auth-phone" className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <div className="relative"><FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="auth-phone" type="tel" inputMode="numeric" maxLength={10} value={form.phone} onChange={(event) => updateField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="10-digit phone number" autoComplete="tel" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" /></div>
                </div>
              )}

              <div>
                <label htmlFor="auth-email" className="block text-sm font-medium text-gray-300 mb-2">Gmail</label>
                <div className="relative"><FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="auth-email" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="yourname@gmail.com" autoComplete="email" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" /></div>
              </div>

              {(mode === 'signup' || authMethod === 'password') && <div>
                <label htmlFor="auth-password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <div className="relative"><FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="auth-password" type="password" minLength={6} value={form.password} onChange={(event) => updateField('password', event.target.value)} placeholder="Minimum 6 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" /></div>
              </div>}

              {mode === 'login' && authMethod === 'otp' && (
                <div>
                  <label htmlFor="auth-otp" className="block text-sm font-medium text-gray-300 mb-2">One-Time Password</label>
                  <div className="relative"><FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" aria-hidden="true" /><input id="auth-otp" type="text" inputMode="numeric" maxLength={6} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" autoComplete="one-time-code" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" /></div>
                </div>
              )}

              {mode === 'signup' && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="auth-address" className="block text-sm font-medium text-gray-300 mb-2">Complete Address</label>
                    <div className="relative"><FaMapMarkerAlt className="absolute left-4 top-4 text-gray-600" aria-hidden="true" /><textarea id="auth-address" value={form.address} onChange={(event) => updateField('address', event.target.value)} placeholder="House / shop no., street, area" autoComplete="street-address" rows={3} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors resize-none" /></div>
                  </div>
                  <div>
                    <label htmlFor="auth-landmark" className="block text-sm font-medium text-gray-300 mb-2">Landmark <span className="text-gray-600">(optional)</span></label>
                    <input id="auth-landmark" type="text" value={form.landmark} onChange={(event) => updateField('landmark', event.target.value)} placeholder="Nearby landmark" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label htmlFor="auth-pincode" className="block text-sm font-medium text-gray-300 mb-2">Pincode</label>
                    <input id="auth-pincode" type="tel" inputMode="numeric" maxLength={6} value={form.pincode} onChange={(event) => updateField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="6-digit pincode" autoComplete="postal-code" className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary transition-colors" />
                  </div>
                </div>
              )}

              {error && <p role="alert" className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">{error}</p>}
              {success && <div role="status" className="flex items-center gap-2 text-sm text-green-300 bg-green-500/10 border border-green-500/20 rounded-xl p-3"><FaCheckCircle aria-hidden="true" />{success}</div>}

              <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-primary to-secondary px-6 py-3.5 rounded-full font-semibold text-lg hover:scale-[1.01] transition-transform">
                {loading ? 'Please wait…' : (mode === 'login' ? (authMethod === 'otp' && !otpSent ? 'Send OTP' : 'Login') : 'Create Account')}
              </button>
            </form>

            <p className="text-center text-sm text-gray-600 mt-6">
              {mode === 'login' ? 'New to RDX Fast Food?' : 'Already have an account?'}{' '}
              <button type="button" onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')} className="text-primary hover:text-white transition-colors font-semibold">
                {mode === 'login' ? 'Create an account' : 'Login'}
              </button>
            </p>

            <p className="text-[11px] leading-5 text-gray-700 mt-5 text-center">Authentication is secured by the RDX Fast Food backend. OTP is shown in development mode for local testing.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
